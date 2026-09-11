import { openSqlite } from "./connection";
let dbInstance: ReturnType<typeof openSqlite> | undefined;
export function getDb() {
  return (dbInstance ??= openSqlite());
}
