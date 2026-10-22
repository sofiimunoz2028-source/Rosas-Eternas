import assert from "node:assert/strict"
import { describeCustom, describeProduct, emptyFlowerSelections, getProduct } from "../src/lib/catalog.ts"
import { buildOrderMessage, displayPhone, formatCop, normalizePhone, readOrder, SHOP_PHONE } from "../src/lib/order.ts"

const classic = getProduct("ramo-clasico")
assert.ok(classic)

const standard = describeProduct(classic, {
  colorIds: ["rojo"],
  sizeId: "estandar",
  wrapId: "foto",
  dedication: "Feliz día",
  recipient: "Ana",
  quantity: 2,
})
assert.equal(standard.unitPrice, 72000)
assert.equal(standard.quantity, 2)
assert.ok(standard.summary.some((line) => line.includes("Ana")))

const mini = describeProduct(classic, {
  colorIds: ["rojo"],
  sizeId: "mini",
  wrapId: "foto",
  dedication: "",
  recipient: "",
  quantity: 1,
})
assert.equal(mini.unitPrice, 58000)

const boxed = describeProduct(classic, {
  colorIds: ["rojo", "blanco"],
  sizeId: "estandar",
  wrapId: "caja",
  dedication: "",
  recipient: "",
  quantity: 1,
})
assert.equal(boxed.unitPrice, 90000)

const picks = emptyFlowerSelections().map((flower) =>
  flower.id === "rosa" ? { ...flower, count: 6, colorId: "rojo" } : flower,
)
const custom = describeCustom(picks, "estandar", "foto", "", "")
assert.equal(custom.unitPrice, 72000)
assert.match(custom.name, /6 flores/)

const message = buildOrderMessage([standard], {
  name: "Liseth",
  phone: "3000000000",
  place: "Bogotá, Chapinero",
  date: "2026-10-24",
  notes: "Tocar antes",
})
assert.match(message, /Ramo clásico rojo × 2/)
assert.match(message, /Liseth/)
assert.match(message, /24\/10\/2026/)
assert.match(message, /Chapinero/)
assert.match(message, /\+57 300 000 0000/)
assert.match(formatCop(72000), /72/)

assert.equal(normalizePhone("300 123 4567"), "3001234567")
assert.equal(normalizePhone("+57 321 547 1953"), "3215471953")
assert.equal(normalizePhone("12345"), null)
assert.equal(displayPhone("3001234567"), "+57 300 123 4567")
assert.equal(SHOP_PHONE, "573215471953")

const parsed = readOrder({
  items: [standard],
  customer: { name: "Liseth", phone: "300 000 0000", place: "Bogotá, Chapinero", date: "2026-10-24", notes: "" },
})
assert.ok(!("error" in parsed))
const missingPhone = readOrder({
  items: [standard],
  customer: { name: "Liseth", phone: "123", place: "Bogotá", date: "", notes: "" },
})
assert.equal("error" in missingPhone && missingPhone.field, "phone")

console.log("order checks ok")
