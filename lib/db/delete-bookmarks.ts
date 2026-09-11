import type Database from "better-sqlite3";

export function deleteBookmarksById(
  db: Database.Database,
  ids: string[],
  userId: string,
) {
  const remove = db.prepare(
    "DELETE FROM bookmarks WHERE id = ? AND user_id = ?",
  );
  return db.transaction(() => {
    let deleted = 0;
    for (const id of new Set(ids)) deleted += remove.run(id, userId).changes;
    return deleted;
  })();
}
