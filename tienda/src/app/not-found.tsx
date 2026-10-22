import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-sm font-medium text-rose">404</p>
      <h1 className="mt-2 font-heading text-4xl text-wine">Esa página no está en el ramo</h1>
      <p className="mt-3 text-muted-foreground">El arreglo que buscas no existe o el enlace cambió.</p>
      <Link href="/catalogo" className={cn(buttonVariants(), "mt-6 h-11 px-5")}>
        Volver al catálogo
      </Link>
    </div>
  )
}
