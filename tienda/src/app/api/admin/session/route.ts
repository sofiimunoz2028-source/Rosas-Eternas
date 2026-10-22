import { cookies } from "next/headers"
import { ADMIN_COOKIE, sessionValid } from "@/lib/admin-session"

export async function GET() {
  const jar = await cookies()
  return Response.json({ ok: sessionValid(jar.get(ADMIN_COOKIE)?.value) })
}
