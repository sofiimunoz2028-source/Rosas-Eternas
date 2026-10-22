import { requireAdmin } from "@/lib/require-admin"
import { safeError } from "@/lib/safe-error"
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
  try {
    const updated = await updatePromotion(id, { active })
    if (!updated) return Response.json({ error: "No encontramos esa promoción." }, { status: 404 })
    return Response.json({ ok: true })
  } catch (error) {
    console.error("update promotion", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const { id } = await context.params
  try {
    await deletePromotion(id)
    return Response.json({ ok: true })
  } catch (error) {
    console.error("delete promotion", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
}
