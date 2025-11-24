import { drizzle } from "drizzle-orm/neon-http";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export const db = drizzle(process.env.DATABASE_URL!);
