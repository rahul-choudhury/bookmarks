import { loadEnvConfig } from "@next/env"
import { defineConfig } from "drizzle-kit"
import { getEnv } from "./lib/env"

loadEnvConfig(process.cwd(), process.env.NODE_ENV === "development")

export default defineConfig({
  schema: ["./lib/db/auth-schema.ts", "./lib/db/bookmarks.ts"],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getEnv("DATABASE_URL"),
  },
})
