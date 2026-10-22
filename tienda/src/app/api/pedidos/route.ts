import { orderTotal, readOrder } from "@/lib/order"
import { requireAdmin } from "@/lib/require-admin"
import { addOrder, listOrders } from "@/lib/shop-store"

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  const orders = await listOrders()
  return Response.json({ orders })
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "El pedido no llegó completo." }, { status: 400 })
  }

  const order = readOrder(payload)
  if ("error" in order) {
    return Response.json({ error: order.error, field: order.field }, { status: 400 })
  }

  const saved = await addOrder({
    customer: order.customer,
    lines: order.lines,
    total: orderTotal(order.lines),
  })
  return Response.json({ ok: true, id: saved.id })
}
