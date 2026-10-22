import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-heading text-2xl text-wine">Rosas Eternas</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Flores hechas a mano con limpiapipas. Se arman al pedido, en los colores que elijas, y no se marchitan.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Visitar</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/catalogo" className="hover:text-wine">Catálogo</Link></li>
            <li><Link href="/personalizar" className="hover:text-wine">Personalizar un ramo</Link></li>
            <li><Link href="/pedido" className="hover:text-wine">Tu pedido</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Pedidos</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En el pedido se pide el celular de quien compra. A ese número se confirma el pago y el domicilio.
          </p>
        </div>
      </div>
    </footer>
  )
}
