import type Database from "better-sqlite3";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

// Retain the original SQL bytes so legacy migration hashes can be recognized.
export function migrate(db: Database.Database, folder = "./migrations/sqlite") {
  db.transaction(() => {
    db.exec(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, hash TEXT NOT NULL)",
    );
    const legacy = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'",
      )
      .get();
    const legacyHashes = new Set(
      legacy
        ? db
            .prepare<[], { hash: string }>(
              "SELECT hash FROM __drizzle_migrations",
            )
            .all()
            .map((row) => row.hash)
        : [],
    );
    for (const name of readdirSync(folder)
      .filter((name) => /^\d+.*\.sql$/.test(name))
      .sort()) {
      const sql = readFileSync(join(folder, name), "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");
      const applied = db
        .prepare<[string], { hash: string }>(
          "SELECT hash FROM schema_migrations WHERE name = ?",
        )
        .get(name);
      if (applied) {
        if (applied.hash !== hash)
          throw new Error(`Applied migration changed: ${name}`);
        continue;
      }
      if (!legacyHashes.has(hash)) db.exec(sql);
      db.prepare(
        "INSERT INTO schema_migrations (name, hash) VALUES (?, ?)",
      ).run(name, hash);
    }
    if (legacy) db.exec("DROP TABLE __drizzle_migrations");
  }).immediate();
}
