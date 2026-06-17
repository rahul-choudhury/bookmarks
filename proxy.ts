import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getAuth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const session = await getAuth().api.getSession({
    headers: request.headers,
  })

  const path = request.nextUrl.pathname
  const isLoginPage = path.startsWith("/login")

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|.*\\.png$|.*\\.svg$).*)",
  ],
}
