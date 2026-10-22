import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { categoryName, type Product } from "@/lib/catalog"
import { formatCop } from "@/lib/order"

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:ring-rose/40"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={`${product.name}, flor de limpiapipas`}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{categoryName(product.category)}</Badge>
          <span className="text-xs text-muted-foreground">{product.pieces}</span>
        </div>
        <h3 className="font-heading text-xl leading-tight text-ink">{product.name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{product.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="font-heading text-lg text-wine">{formatCop(product.price)}</p>
          <span className="text-sm font-medium text-rose">Personalizar</span>
        </div>
      </div>
    </Link>
  )
}
