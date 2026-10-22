import { cookies } from "next/headers"
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-session"

export async function POST(request: Request) {
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, "", { ...adminCookieOptions(request), maxAge: 0 })
  return Response.json({ ok: true })
}
