"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingBag } from "lucide-react"
import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart"
import { cn } from "cn"

const LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/personalizar", label: "Personalizar" },
  { href: "/pedido", label: "Pedido" },
]

function linkClass(active: boolean) {
  return cn(
    "rounded-full px-3 py-2 text-sm font-medium transition",
    active ? "bg-accent text-wine" : "text-ink/80 hover:bg-muted hover:text-ink",
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-accent text-wine" aria-hidden>
            <svg viewBox="0 0 32 32" className="size-6">
              <circle cx="16" cy="13" r="7" fill="#6B1535" />
              <circle cx="16" cy="13" r="4" fill="#F48FB1" />
              <path d="M16 20v8" stroke="#2F6B4F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-heading text-lg leading-none text-wine">Rosas Eternas</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(pathname.startsWith(link.href))}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/pedido"
          className={cn(buttonVariants({ size: "sm" }), "relative h-8 px-3")}
          aria-label={`Pedido, ${count} artículos`}
        >
          <ShoppingBag />
          <span className="hidden sm:inline">Pedido</span>
          {count > 0 && (
            <span className="grid min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-semibold text-ink">
              {count}
            </span>
          )}
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
            aria-label="Abrir menú"
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="left" className="bg-background">
            <SheetHeader>
              <SheetTitle className="font-heading text-xl text-wine">Rosas Eternas</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Móvil">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(linkClass(pathname.startsWith(link.href)), "px-3 py-3 text-base")}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

