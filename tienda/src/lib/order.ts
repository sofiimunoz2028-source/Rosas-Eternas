export const WHATSAPP_PHONE = "573215471953"
export const WHATSAPP_DISPLAY = "+57 321 547 1953"

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

export function buildOrderMessage(lines: OrderLine[], customer: CustomerDetails) {
  const chunks = ["Hola Rosas Eternas, quiero hacer este pedido:", ""]
  lines.forEach((line, index) => {
    chunks.push(
      `${index + 1}. ${line.name} × ${line.quantity} — ${formatCop(line.unitPrice * line.quantity)}`,
    )
    for (const detail of line.summary) chunks.push(`   · ${detail}`)
    chunks.push("")
  })
  chunks.push(`Total: ${formatCop(orderTotal(lines))}`, "")
  chunks.push("Datos para la entrega")
  chunks.push(`Nombre: ${customer.name.trim()}`)
  if (customer.phone.trim()) chunks.push(`Celular: ${customer.phone.trim()}`)
  chunks.push(`Ciudad y barrio: ${customer.place.trim()}`)
  if (customer.date) chunks.push(`Fecha: ${formatDate(customer.date)}`)
  if (customer.notes.trim()) chunks.push(`Notas: ${customer.notes.trim()}`)
  chunks.push(
    "",
    "El pago lo coordinamos por este chat: efectivo, transferencia o contraentrega.",
  )
  return chunks.join("\n")
}

export function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`
}

export const WHATSAPP_HELLO = whatsappLink(
  "Hola Rosas Eternas, quiero un arreglo de flores de limpiapipas.",
)
