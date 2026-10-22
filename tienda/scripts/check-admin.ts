import assert from "node:assert/strict"
import { passwordsMatch, sessionValid, signSession } from "../src/lib/admin-session.ts"

process.env.SHOP_ADMIN_PASSWORD = "clave-de-prueba"
process.env.SHOP_ADMIN_SECRET = "test-secret-for-admin-session"

assert.equal(passwordsMatch("clave-de-prueba"), true)
assert.equal(passwordsMatch("otra-clave"), false)
assert.equal(passwordsMatch(""), false)

const token = signSession(Date.parse("2026-10-22T12:00:00Z"))
assert.equal(sessionValid(token, Date.parse("2026-10-22T12:00:00Z")), true)
assert.equal(sessionValid(token, Date.parse("2026-11-01T12:00:00Z")), false)
assert.equal(sessionValid("nope.token"), false)
assert.equal(sessionValid(undefined), false)

console.log("admin checks ok")
