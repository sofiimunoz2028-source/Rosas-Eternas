export const SHOP_PHONE = "573215471953"

export type OrderLine = {
  name: string
  quantity: number
  unitPrice: number
  summary: string[]
}

export type CustomerDetails = {
  name: string
  phone: string
  place: string
  date: string
  notes: string
}

export function formatCop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  return `${match[3]}/${match[2]}/${match[1]}`
}

export function orderTotal(lines: OrderLine[]) {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
}

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "")
  const local = digits.startsWith("57") && digits.length === 12 ? digits.slice(2) : digits
  if (local.length === 10 && local.startsWith("3")) return local
  return null
}

export function displayPhone(local: string) {
  return `+57 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

export function buildOrderMessage(lines: OrderLine[], customer: CustomerDetails) {
  const phone = normalizePhone(customer.phone)
  const chunks = [
    "Nuevo pedido · Rosas Eternas",
    "",
    `Nombre: ${customer.name.trim()}`,
    `Celular: ${phone ? displayPhone(phone) : customer.phone.trim()}`,
    `Ciudad y barrio: ${customer.place.trim()}`,
  ]
  if (customer.date) chunks.push(`Fecha: ${formatDate(customer.date)}`)
  if (customer.notes.trim()) chunks.push(`Notas: ${customer.notes.trim()}`)
  chunks.push("", "Detalle")
  lines.forEach((line, index) => {
    chunks.push(
      `${index + 1}. ${line.name} × ${line.quantity} — ${formatCop(line.unitPrice * line.quantity)}`,
    )
    for (const detail of line.summary) chunks.push(`   · ${detail}`)
  })
  chunks.push("", `Total: ${formatCop(orderTotal(lines))}`)
  chunks.push("Confirmar pago y entrega con el celular del pedido.")
  return chunks.join("\n")
}

const MAX_LINES = 20
const MAX_SUMMARY = 8

export function readOrder(body: unknown):
  | { lines: OrderLine[]; customer: CustomerDetails }
  | { error: string; field?: "name" | "phone" | "place" } {
  if (!body || typeof body !== "object") return { error: "El pedido no llegó completo." }
  const record = body as { items?: unknown; customer?: unknown }
  if (!Array.isArray(record.items) || record.items.length === 0) {
    return { error: "Agrega al menos una flor al pedido." }
  }
  if (record.items.length > MAX_LINES) return { error: "El pedido tiene demasiados arreglos." }

  const lines: OrderLine[] = []
  for (const item of record.items) {
    if (!item || typeof item !== "object") return { error: "Hay un arreglo que no se pudo leer." }
    const row = item as Partial<OrderLine>
    const name = typeof row.name === "string" ? row.name.trim() : ""
    const quantity = Number(row.quantity)
    const unitPrice = Number(row.unitPrice)
    if (!name || name.length > 80) return { error: "Hay un arreglo sin nombre." }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 12) {
      return { error: "Revisa las cantidades del pedido." }
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 2_000_000) {
      return { error: "Hay un precio que no se pudo leer." }
    }
    const summary = Array.isArray(row.summary)
      ? row.summary
          .filter((line): line is string => typeof line === "string")
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, MAX_SUMMARY)
      : []
    lines.push({ name, quantity, unitPrice, summary })
  }

  const customer = record.customer
  if (!customer || typeof customer !== "object") {
    return { error: "Faltan los datos de quien pide.", field: "name" }
  }
  const details = customer as Partial<CustomerDetails>
  const name = typeof details.name === "string" ? details.name.trim() : ""
  const place = typeof details.place === "string" ? details.place.trim() : ""
  const phoneInput = typeof details.phone === "string" ? details.phone : ""
  const phone = normalizePhone(phoneInput)
  const date = typeof details.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(details.date) ? details.date : ""
  const notes = typeof details.notes === "string" ? details.notes.trim().slice(0, 240) : ""

  if (!name || name.length > 80) return { error: "Escribe tu nombre para el pedido.", field: "name" }
  if (!phone) return { error: "Escribe un celular de 10 dígitos. Ejemplo: 300 123 4567.", field: "phone" }
  if (!place || place.length > 120) return { error: "Escribe la ciudad y el barrio.", field: "place" }

  return { lines, customer: { name, phone, place, date, notes } }
}

export function whatsappLink(text: string) {
  return `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`
}
