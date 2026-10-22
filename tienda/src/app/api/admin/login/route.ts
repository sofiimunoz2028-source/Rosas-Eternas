import { cookies } from "next/headers"
import { ADMIN_COOKIE, adminCookieOptions, passwordsMatch, signSession } from "@/lib/admin-session"

export async function POST(request: Request) {
  let password = ""
  try {
    const body = (await request.json()) as { password?: unknown }
    if (typeof body.password === "string") password = body.password
  } catch {
    password = ""
  }

  if (!passwordsMatch(password)) {
    return Response.json({ error: "La contraseña no coincide." }, { status: 401 })
  }

  const jar = await cookies()
  jar.set(ADMIN_COOKIE, signSession(), adminCookieOptions(request))
  return Response.json({ ok: true })
}
