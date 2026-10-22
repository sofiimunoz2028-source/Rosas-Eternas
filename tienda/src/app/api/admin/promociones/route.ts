import { requireAdmin } from "@/lib/require-admin"
import { safeError } from "@/lib/safe-error"
import { addPromotion, listPromotions } from "@/lib/shop-store"

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    return Response.json({ promotions: await listPromotions(false) })
  } catch (error) {
    console.error("list promotions", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  let title = ""
  let detail = ""
  try {
    const body = (await request.json()) as { title?: unknown; detail?: unknown }
    if (typeof body.title === "string") title = body.title.trim()
    if (typeof body.detail === "string") detail = body.detail.trim()
  } catch {
    title = ""
  }
  if (!title || title.length > 80) {
    return Response.json({ error: "Escribe un título de hasta 80 caracteres." }, { status: 400 })
  }
  if (detail.length > 240) {
    return Response.json({ error: "El detalle puede tener hasta 240 caracteres." }, { status: 400 })
  }
  try {
    const promotion = await addPromotion({ title, detail })
    return Response.json({ promotion })
  } catch (error) {
    console.error("save promotion", safeError(error))
    return Response.json({ error: safeError(error) }, { status: 500 })
  }
}
