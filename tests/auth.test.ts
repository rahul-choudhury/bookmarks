import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate } from "../lib/db/migrate";
import { deleteBookmarksById } from "../lib/db/delete-bookmarks";

test("OTP signup, session, replay rejection, password disabled, and private library isolation", async () => {
  const directory = mkdtempSync(join(tmpdir(), "bookmarks-auth-"));
  process.env.SQLITE_PATH = join(directory, "test.db");
  process.env.BETTER_AUTH_SECRET =
    "test-only-secret-with-at-least-thirty-two-characters";
  process.env.RESEND_API_KEY = "test-only";
  process.env.AUTH_EMAIL_FROM = "Bookmarks <login@example.com>";
  const { getDb } = await import("../lib/db/index");
  const { createAuth } = await import("../lib/auth");
  const db = getDb();
  migrate(db);
  const originalFetch = globalThis.fetch;
  let code = "";
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    code = body.text.match(/\b\d{6}\b/)[0];
    return new Response(JSON.stringify({ id: "sent" }), { status: 200 });
  };
  try {
    const auth = createAuth();
    await auth.api.sendVerificationOTP({
      body: { email: "one@example.com", type: "sign-in" },
    });
    assert.match(code, /^\d{6}$/);
    const first = await auth.api.signInEmailOTP({
      body: { email: "one@example.com", otp: code },
      asResponse: true,
    });
    assert.equal(first.status, 200);
    const result = await first.json();
    assert.equal(result.user.emailVerified, true);
    assert.ok(first.headers.get("set-cookie"));
    await assert.rejects(
      auth.api.signInEmailOTP({
        body: { email: "one@example.com", otp: code },
      }),
    );
    await auth.api.sendVerificationOTP({
      body: { email: "two@example.com", type: "sign-in" },
    });
    const second = await auth.api.signInEmailOTP({
      body: { email: "two@example.com", otp: code },
    });
    const insert = db.prepare(
      'INSERT INTO bookmarks (id, url, "timeStamp", user_id) VALUES (?, ?, 0, ?)',
    );
    insert.run("one", "https://example.com", result.user.id);
    insert.run("two", "https://example.com", second.user.id);
    assert.equal(deleteBookmarksById(db, ["one", "two"], result.user.id), 1);
    assert.deepEqual(
      db
        .prepare("SELECT id FROM bookmarks WHERE user_id = ?")
        .all(second.user.id),
      [{ id: "two" }],
    );
    const denied = await auth.handler(
      new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "one@example.com",
          password: "not-supported",
        }),
      }),
    );
    assert.notEqual(denied.status, 200);
    const passkeys = await auth.handler(
      new Request("http://localhost:3000/api/auth/passkey/list-user-passkeys"),
    );
    assert.equal(passkeys.status, 401);
  } finally {
    globalThis.fetch = originalFetch;
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
