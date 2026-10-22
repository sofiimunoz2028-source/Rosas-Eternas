import { createHmac, timingSafeEqual } from "node:crypto"

export const ADMIN_COOKIE = "rosas_admin"
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7

function secret() {
  return process.env.SHOP_ADMIN_SECRET || ""
}

export function passwordsMatch(input: string) {
  const expected = process.env.SHOP_ADMIN_PASSWORD || ""
  if (!expected || !secret() || !input) return false
  const given = Buffer.from(input)
  const actual = Buffer.from(expected)
  if (given.length !== actual.length) return false
  return timingSafeEqual(given, actual)
}

export function signSession(now = Date.now()) {
  const exp = Math.floor(now / 1000) + ADMIN_MAX_AGE
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url")
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url")
  return `${payload}.${signature}`
}

export function sessionValid(token: string | undefined, now = Date.now()) {
  if (!token || !secret()) return false
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return false
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url")
  const given = Buffer.from(signature)
  const actual = Buffer.from(expected)
  if (given.length !== actual.length || !timingSafeEqual(given, actual)) return false
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number }
    return typeof data.exp === "number" && data.exp * 1000 > now
  } catch {
    return false
  }
}

export function adminCookieOptions(request?: Request) {
  const forwarded = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const secure = forwarded ? forwarded === "https" : request?.url.startsWith("https:") === true
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  }
}
