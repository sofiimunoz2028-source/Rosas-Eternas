import { requireAdmin } from "@/lib/require-admin"
import { safeError } from "@/lib/safe-error"
import { deleteOrder, setOrderStatus } from "@/lib/shop-store"
import type { OrderStatus } from "@/lib/shop-types"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await context.params
  let status: OrderStatus | null = null
  try {
    const body = (await request.json()) as { status?: unknown }
    if (body.status === "nuevo" || body.status === "revisado") status = body.status
  } catch {
    status = null
  }
  if (!status) return Response.json({ error: "El estado no es válido." }, { status: 400 })
  try {
    const updated = await setOrderStatus(id, status)
    if (!updated) return Response.json({ error: "No encontramos ese pedido." }, { status: 404 })
    return Response.json({ ok: true })
  } catch (error) {
    console.error("update order", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await context.params
  try {
    await deleteOrder(id)
    return Response.json({ ok: true })
  } catch (error) {
    console.error("delete order", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
}
