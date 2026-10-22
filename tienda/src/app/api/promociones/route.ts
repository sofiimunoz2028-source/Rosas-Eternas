import { listPromotions } from "@/lib/shop-store"

export async function GET() {
  const promotions = await listPromotions(true)
  return Response.json(
    { promotions },
    { headers: { "Cache-Control": "no-store" } },
  )
}
