import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { openSqlite } from "../lib/db/connection";
import { migrate } from "../lib/db/migrate";
import {
  bookmarkColumns,
  insertBookmarkSql,
  type BookmarkRow,
} from "../lib/db/bookmarks";

test("raw SQLite persistence, duplicate imports, rollback, edits, deletion and backup", async () => {
  const directory = mkdtempSync(join(tmpdir(), "bookmarks-test-"));
  const file = join(directory, "test.db");
  let db = openSqlite(file);
  try {
    migrate(db);
    migrate(db);
    db.exec(
      `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES ('test', 'Test', 'test@example.com', 1, 0, 0)`,
    );
    const saved = {
      isRead: 0,
      id: crypto.randomUUID(),
      url: "https://example.com/",
      title: "Robert'); DROP TABLE bookmarks;--",
      favicon: null,
      ogImage: null,
      timeStamp: Date.now(),
    };
    assert.equal(
      db.prepare(insertBookmarkSql).run({ ...saved, userId: "test" }).changes,
      1,
    );
    assert.equal(
      db
        .prepare(insertBookmarkSql)
        .run({ ...saved, userId: "test", id: crypto.randomUUID() }).changes,
      0,
    );
    assert.throws(
      () =>
        db.transaction(() => {
          db.prepare(insertBookmarkSql).run({
            ...saved,
            userId: "test",
            id: crypto.randomUUID(),
            url: "https://example.org/",
          });
          throw new Error("abort import");
        })(),
      /abort import/,
    );
    assert.equal(db.prepare("SELECT * FROM bookmarks").all().length, 1);
    assert.deepEqual(
      db.prepare(`SELECT ${bookmarkColumns} FROM bookmarks`).get(),
      saved,
    );
    db.prepare("UPDATE bookmarks SET title = ?, og_image = ? WHERE id = ?").run(
      "Updated",
      "https://example.com/og.png",
      saved.id,
    );
    db.close();
    db = openSqlite(file);
    const row = db
      .prepare<[], BookmarkRow>(`SELECT ${bookmarkColumns} FROM bookmarks`)
      .get()!;
    assert.equal(row.title, "Updated");
    assert.equal(row.ogImage, "https://example.com/og.png");
    assert.equal(row.timeStamp, saved.timeStamp);
    await db.backup(join(directory, "backup.db"));
    assert.equal(
      db.prepare("DELETE FROM bookmarks WHERE id = ?").run(saved.id).changes,
      1,
    );
    assert.equal(
      db.prepare("DELETE FROM bookmarks WHERE id = ?").run(saved.id).changes,
      0,
    );
    const backup = openSqlite(join(directory, "backup.db"));
    try {
      assert.deepEqual(
        backup.prepare(`SELECT ${bookmarkColumns} FROM bookmarks`).get(),
        row,
      );
      assert.equal(backup.pragma("integrity_check", { simple: true }), "ok");
    } finally {
      backup.close();
    }
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("adopts existing ORM migration history without replaying or losing bookmarks", () => {
  const db = openSqlite(":memory:");
  try {
    db.exec(
      "CREATE TABLE __drizzle_migrations (id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at NUMERIC)",
    );
    for (const name of readdirSync("migrations/sqlite")
      .filter((name) => name.endsWith(".sql"))
      .sort()) {
      const sql = readFileSync(join("migrations/sqlite", name), "utf8");
      db.exec(sql);
      db.prepare(
        "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
      ).run(createHash("sha256").update(sql).digest("hex"), Date.now());
    }
    db.exec(
      `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES ('test', 'Test', 'test@example.com', 1, 0, 0)`,
    );
    const saved = {
      isRead: 0,
      id: "existing",
      url: "https://example.com",
      title: null,
      favicon: null,
      ogImage: null,
      timeStamp: 123,
    };
    db.prepare(insertBookmarkSql).run({
      ...saved,
      userId: "test",
    });
    migrate(db);
    migrate(db);
    assert.deepEqual(
      db.prepare(`SELECT ${bookmarkColumns} FROM bookmarks`).get(),
      saved,
    );
    assert.equal(
      db
        .prepare(
          "SELECT name FROM sqlite_master WHERE name = '__drizzle_migrations'",
        )
        .get(),
      undefined,
    );
  } finally {
    db.close();
  }
});

test("reading status defaults to unread and persists with a constrained value", () => {
  const db = openSqlite(":memory:");
  try {
    migrate(db);
    db.prepare(
      'INSERT INTO bookmarks (id, url, "timeStamp") VALUES (?, ?, ?)',
    ).run("read-test", "https://example.com", 123);
    assert.deepEqual(db.prepare("SELECT is_read FROM bookmarks").get(), {
      is_read: 0,
    });
    db.prepare("UPDATE bookmarks SET is_read = ? WHERE id = ?").run(
      1,
      "read-test",
    );
    assert.equal(
      db.prepare("SELECT id FROM bookmarks WHERE is_read = 1").all().length,
      1,
    );
    assert.equal(
      db.prepare("SELECT id FROM bookmarks WHERE is_read = 0").all().length,
      0,
    );
    assert.throws(
      () => db.prepare("UPDATE bookmarks SET is_read = 2").run(),
      /CHECK/,
    );
    db.prepare("UPDATE bookmarks SET is_read = 0").run();
    assert.equal(
      db.prepare("SELECT id FROM bookmarks WHERE is_read = 0").all().length,
      1,
    );
  } finally {
    db.close();
  }
});
