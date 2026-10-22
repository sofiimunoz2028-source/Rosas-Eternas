import assert from "node:assert/strict"
import { describeCustom, describeProduct, emptyFlowerSelections, getProduct } from "../src/lib/catalog.ts"
import { buildOrderMessage, formatCop, whatsappLink, WHATSAPP_PHONE } from "../src/lib/order.ts"

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
assert.match(formatCop(72000), /72/)

const link = whatsappLink(message)
assert.ok(link.startsWith(`https://wa.me/${WHATSAPP_PHONE}?text=`))
assert.equal(WHATSAPP_PHONE, "573215471953")

console.log("order checks ok")
