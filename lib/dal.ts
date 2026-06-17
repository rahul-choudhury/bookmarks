import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { getAuth } from "./auth"

export const verifySession = cache(async () => {
  const headersList = await headers()
  const session = await getAuth().api.getSession({ headers: headersList })

  if (!session) {
    redirect("/login")
  }

  return { isAuth: true, userId: session.user.id }
})
