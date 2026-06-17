import { toNextJsHandler } from "better-auth/next-js"
import { getAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return toNextJsHandler(getAuth().handler).GET(request)
}

export async function POST(request: Request) {
  return toNextJsHandler(getAuth().handler).POST(request)
}
