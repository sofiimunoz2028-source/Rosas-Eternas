import { cookies } from "next/headers"
import { ADMIN_COOKIE, sessionValid } from "@/lib/admin-session"

export async function requireAdmin() {
  const jar = await cookies()
  if (!sessionValid(jar.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 })
  }
  return null
}
