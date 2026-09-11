import assert from "node:assert/strict";
import { test } from "node:test";
import { openSqlite } from "../lib/db/connection";
import { migrate } from "../lib/db/migrate";
import { deleteBookmarksById } from "../lib/db/delete-bookmarks";

test("batch delete affects only selected IDs and rolls back on failure", () => {
  const db = openSqlite(":memory:");
  try {
    migrate(db);
    db.exec(
      `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES ('test', 'Test', 'test@example.com', 1, 0, 0)`,
    );
    const insert = db.prepare(
      `INSERT INTO bookmarks (id, url, "timeStamp", user_id) VALUES (?, ?, 0, 'test')`,
    );
    for (const id of ["a", "b", "c"])
      insert.run(id, `https://example.com/${id}`);
    db.exec(
      "CREATE TRIGGER prevent_b BEFORE DELETE ON bookmarks WHEN OLD.id = 'b' BEGIN SELECT RAISE(ABORT, 'blocked'); END",
    );
    assert.throws(() => deleteBookmarksById(db, ["a", "b"], "test"), /blocked/);
    assert.equal(db.prepare("SELECT id FROM bookmarks").all().length, 3);
    db.exec("DROP TRIGGER prevent_b");
    assert.equal(
      deleteBookmarksById(db, ["a", "b", "a", "missing"], "test"),
      2,
    );
    assert.deepEqual(db.prepare("SELECT id FROM bookmarks").all(), [
      { id: "c" },
    ]);
  } finally {
    db.close();
  }
});
