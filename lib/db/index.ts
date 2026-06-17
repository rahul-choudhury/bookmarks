import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { getEnv } from "../env"

function createDb() {
  const pool = new Pool({ connectionString: getEnv("DATABASE_URL") })
  return drizzle({ client: pool })
}

type DbInstance = ReturnType<typeof createDb>

let dbInstance: DbInstance | undefined

export function getDb(): DbInstance {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = createDb()

  return dbInstance
}
