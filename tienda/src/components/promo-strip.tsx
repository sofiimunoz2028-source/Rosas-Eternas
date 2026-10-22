import { connection } from "next/server"
import { listPromotions } from "@/lib/shop-store"

export async function PromoStrip() {
  await connection()
  let promotions: Awaited<ReturnType<typeof listPromotions>> = []
  try {
    promotions = await listPromotions(true)
  } catch {
    return null
  }
  if (promotions.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-2" aria-label="Promociones">
      <div className="grid gap-3 md:grid-cols-2">
        {promotions.map((promotion) => (
          <article key={promotion.id} className="rounded-2xl bg-wine px-5 py-4 text-primary-foreground">
            <p className="text-xs font-medium tracking-wide text-gold uppercase">Promoción</p>
            <h2 className="mt-1 font-heading text-2xl">{promotion.title}</h2>
            {promotion.detail && <p className="mt-1 text-sm text-primary-foreground/80">{promotion.detail}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}
