import type { Metadata } from "next"
import { Suspense } from "react"
import { CatalogBrowser } from "@/components/catalog-browser"

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Ramos, cajas y flores de limpiapipas con precio. Personaliza colores, tamaño y dedicatoria.",
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-muted-foreground">Cargando catálogo…</p>}>
      <CatalogBrowser />
    </Suspense>
  )
}
