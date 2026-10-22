import { requireAdmin } from "@/lib/require-admin"
import { deletePromotion, updatePromotion } from "@/lib/shop-store"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await context.params
  let active: boolean | null = null
  try {
    const body = (await request.json()) as { active?: unknown }
    if (typeof body.active === "boolean") active = body.active
  } catch {
    active = null
  }
  if (active === null) return Response.json({ error: "Indica si la promoción sigue activa." }, { status: 400 })
  const updated = await updatePromotion(id, { active })
  if (!updated) return Response.json({ error: "No encontramos esa promoción." }, { status: 404 })
  return Response.json({ ok: true })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await context.params
  await deletePromotion(id)
  return Response.json({ ok: true })
}
