import { loadEnvConfig } from "@next/env";
import { migrate } from "../lib/db/migrate";
import { openSqlite } from "../lib/db/connection";
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const client = openSqlite();
try {
  migrate(client);
  console.log("SQLite migrations applied.");
} finally {
  client.close();
}
