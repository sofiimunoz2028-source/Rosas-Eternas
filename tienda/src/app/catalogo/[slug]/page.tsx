import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductCard } from "@/components/product-card"
import { ProductDetail } from "@/components/product-detail"
import { categoryName, getProduct, products } from "@/lib/catalog"

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: "Arreglo" }
  return {
    title: product.name,
    description: product.summary,
    openGraph: { images: [product.image] },
  }
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-muted-foreground">Cargando arreglo…</p>}>
      <ProductPage params={params} />
    </Suspense>
  )
}

async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()
  const related = products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 3)

  return (
    <>
      <ProductDetail product={product} />
      {related.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16">
          <h2 className="font-heading text-3xl text-wine">Más en {categoryName(product.category).toLowerCase()}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
