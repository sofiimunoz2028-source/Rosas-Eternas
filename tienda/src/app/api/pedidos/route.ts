import { orderTotal, readOrder } from "@/lib/order"
import { requireAdmin } from "@/lib/require-admin"
import { safeError } from "@/lib/safe-error"
import { addOrder, listOrders } from "@/lib/shop-store"

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const orders = await listOrders()
    return Response.json({ orders })
  } catch (error) {
    console.error("list orders", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
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

  try {
    const saved = await addOrder({
      customer: order.customer,
      lines: order.lines,
      total: orderTotal(order.lines),
    })
    return Response.json({ ok: true, id: saved.id })
  } catch (error) {
    console.error("save order", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
}
