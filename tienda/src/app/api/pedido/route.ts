import { buildOrderMessage, readOrder } from "@/lib/order"
import { deliverOrder } from "@/lib/send-order"

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "El pedido no llegó completo." }, { status: 400 })
  }

  if (payload && typeof payload === "object" && "company" in payload) {
    const company = (payload as { company?: unknown }).company
    if (typeof company === "string" && company.trim()) {
      return Response.json({ ok: true })
    }
  }

  const order = readOrder(payload)
  if ("error" in order) {
    return Response.json({ error: order.error, field: order.field }, { status: 400 })
  }

  const sent = await deliverOrder(buildOrderMessage(order.lines, order.customer))
  if (!sent.ok) {
    return Response.json(
      { error: "No pudimos enviar el pedido. Se quedó guardado en esta página: inténtalo otra vez." },
      { status: 503 },
    )
  }

  return Response.json({ ok: true })
}
