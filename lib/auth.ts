import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { getDb } from "./db"
import { account, session, user, verification } from "./db/auth-schema"
import { getEnv } from "./env"

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    trustedOrigins: ["https://bookmarks.rchoudhury.dev"],
    socialProviders: {
      github: {
        clientId: getEnv("GITHUB_CLIENT_ID"),
        clientSecret: getEnv("GITHUB_CLIENT_SECRET"),
      },
      google: {
        clientId: getEnv("GOOGLE_CLIENT_ID"),
        clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
      },
    },
  })
}

type AuthInstance = ReturnType<typeof createAuth>

let authInstance: AuthInstance | undefined

export function getAuth(): AuthInstance {
  if (authInstance) {
    return authInstance
  }

  authInstance = createAuth()

  return authInstance
}
