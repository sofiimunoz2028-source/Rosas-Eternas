import { requireAdmin } from "@/lib/require-admin"
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
  const updated = await setOrderStatus(id, status)
  if (!updated) return Response.json({ error: "No encontramos ese pedido." }, { status: 404 })
  return Response.json({ ok: true })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await context.params
  await deleteOrder(id)
  return Response.json({ ok: true })
}
