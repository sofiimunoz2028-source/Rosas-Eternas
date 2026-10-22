"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { CATEGORIES, products, type CategoryId } from "@/lib/catalog"
import { cn } from "cn"

type SortId = "destacados" | "menor" | "mayor"
type FilterId = "todas" | CategoryId

const FILTERS: { id: FilterId; name: string }[] = [
  { id: "todas", name: "Todas" },
  ...CATEGORIES,
]

function isFilter(value: string | null): value is FilterId {
  return FILTERS.some((filter) => filter.id === value)
}

export function CatalogBrowser() {
  const params = useSearchParams()
  const initialFilter = params.get("categoria")
  const [query, setQuery] = useState(params.get("q") ?? "")
  const [filter, setFilter] = useState<FilterId>(isFilter(initialFilter) ? initialFilter : "todas")
  const [sort, setSort] = useState<SortId>("destacados")

  const visible = useMemo(() => {
    const needle = query
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim()
    const list = products.filter((product) => {
      if (filter !== "todas" && product.category !== filter) return false
      if (!needle) return true
      const haystack = `${product.name} ${product.summary} ${product.pieces} ${product.description}`
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
      return haystack.includes(needle)
    })
    const sorted = [...list]
    if (sort === "menor") sorted.sort((a, b) => a.price - b.price)
    if (sort === "mayor") sorted.sort((a, b) => b.price - a.price)
    if (sort === "destacados") {
      sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    }
    return sorted
  }, [query, filter, sort])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <p className="text-sm font-medium text-rose">Catálogo</p>
      <h1 className="mt-1 font-heading text-4xl text-wine">Flores de limpiapipas</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Cada pieza tiene precio. Ábrela para elegir colores, tamaño, empaque y la dedicatoria. El pedido se envía por WhatsApp.
      </p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca rosa, girasol, caja..."
            aria-label="Buscar en el catálogo"
            className="h-11 pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ordenar</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="destacados">Destacados</option>
            <option value="menor">Menor precio</option>
            <option value="mayor">Mayor precio</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Categorías">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm",
              filter === item.id
                ? "border-wine bg-wine text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="font-heading text-2xl text-wine">Nada coincide con esa búsqueda</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Prueba con otro nombre o mira todo el catálogo.
          </p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-rose underline-offset-4 hover:underline"
            onClick={() => {
              setQuery("")
              setFilter("todas")
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
