import { safeError } from "@/lib/safe-error"
import { listPromotions } from "@/lib/shop-store"

export async function GET() {
  try {
    const promotions = await listPromotions(true)
    return Response.json({ promotions }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("public promotions", safeError(error))
    return Response.json({ promotions: [] }, { headers: { "Cache-Control": "no-store" } })
  }
}
