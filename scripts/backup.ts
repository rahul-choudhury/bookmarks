import { loadEnvConfig } from "@next/env";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { openSqlite } from "../lib/db/connection";
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
async function main() {
  const destination =
    process.argv[2] || `./data/backups/bookmarks-${Date.now()}.db`;
  mkdirSync(dirname(destination), { recursive: true });
  const client = openSqlite();
  try {
    await client.backup(destination);
    console.log(`Backup saved to ${destination}`);
  } finally {
    client.close();
  }
}
main().catch(() => {
  console.error("Backup failed. Check the source and destination paths.");
  process.exitCode = 1;
});
