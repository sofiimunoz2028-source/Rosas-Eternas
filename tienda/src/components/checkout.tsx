"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { QuantityStepper } from "@/components/choices"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart"
import { MAX_QUANTITY } from "@/lib/catalog"
import {
  buildOrderMessage,
  formatCop,
  whatsappLink,
  WHATSAPP_DISPLAY,
  type CustomerDetails,
} from "@/lib/order"
import { cn } from "cn"

const EMPTY: CustomerDetails = { name: "", phone: "", place: "", date: "", notes: "" }

export function Checkout() {
  const { items, hydrated, total, setQuantity, removeItem, clear } = useCart()
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY)
  const [errors, setErrors] = useState<{ name?: string; place?: string }>({})
  const [sent, setSent] = useState(false)

  function patch(partial: Partial<CustomerDetails>) {
    setCustomer((current) => ({ ...current, ...partial }))
  }

  function send() {
    const next = {
      name: customer.name.trim() ? undefined : "Escribe tu nombre para el pedido.",
      place: customer.place.trim() ? undefined : "Escribe la ciudad y el barrio.",
    }
    setErrors(next)
    if (next.name || next.place || items.length === 0) return
    const link = whatsappLink(buildOrderMessage(items, customer))
    window.open(link, "_blank", "noopener,noreferrer")
    setSent(true)
  }

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <p className="text-muted-foreground">Cargando tu pedido…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <div className="relative mx-auto size-40 overflow-hidden rounded-full bg-muted">
          <Image src="/flores/rosa-individual.jpg" alt="" fill sizes="160px" className="object-cover" />
        </div>
        <h1 className="mt-6 font-heading text-4xl text-wine">Tu pedido está vacío</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Elige un arreglo del catálogo o arma un ramo. Después lo enviamos al WhatsApp {WHATSAPP_DISPLAY}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/catalogo" className={cn(buttonVariants(), "h-11 px-5")}>
            Ver catálogo
          </Link>
          <Link href="/personalizar" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}>
            Personalizar
          </Link>
        </div>
      </div>
    )
  }

  const fallback = whatsappLink(buildOrderMessage(items, customer))

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:py-12">
      <div>
        <h1 className="font-heading text-4xl text-wine">Tu pedido</h1>
        <p className="mt-2 text-muted-foreground">
          Revisa las flores y los datos. El botón abre WhatsApp {WHATSAPP_DISPLAY} con el mensaje listo.
        </p>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/10">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-xl leading-tight">{item.name}</h2>
                  <p className="shrink-0 text-sm font-medium">{formatCop(item.unitPrice * item.quantity)}</p>
                </div>
                <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                  {item.summary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <QuantityStepper
                    label={item.name}
                    value={item.quantity}
                    max={MAX_QUANTITY}
                    onChange={(quantity) => setQuantity(item.id, quantity)}
                  />
                  <button
                    type="button"
                    className="text-sm text-rose underline-offset-4 hover:underline"
                    onClick={() => removeItem(item.id)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form
        className="h-fit space-y-4 rounded-3xl bg-card p-5 ring-1 ring-foreground/10 md:sticky md:top-24"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <h2 className="font-heading text-2xl">Datos para la entrega</h2>
        <div className="space-y-2">
          <Label htmlFor="name">Tu nombre</Label>
          <Input
            id="name"
            required
            autoComplete="name"
            value={customer.name}
            aria-invalid={Boolean(errors.name)}
            className="h-11"
            onChange={(event) => patch({ name: event.target.value })}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Celular</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Opcional, por si hay que confirmar"
            value={customer.phone}
            className="h-11"
            onChange={(event) => patch({ phone: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="place">Ciudad y barrio</Label>
          <Input
            id="place"
            required
            autoComplete="address-level2"
            placeholder="Ejemplo: Bogotá, Chapinero"
            value={customer.place}
            aria-invalid={Boolean(errors.place)}
            className="h-11"
            onChange={(event) => patch({ place: event.target.value })}
          />
          {errors.place && <p className="text-sm text-destructive">{errors.place}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha en la que lo necesitas</Label>
          <Input
            id="date"
            type="date"
            value={customer.date}
            className="h-11"
            onChange={(event) => patch({ date: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={customer.notes}
            maxLength={240}
            placeholder="Horario, punto de encuentro u otro detalle"
            onChange={(event) => patch({ notes: event.target.value })}
          />
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-heading text-3xl">{formatCop(total)}</span>
        </div>
        <Button type="submit" className="h-11 w-full bg-leaf text-white hover:bg-leaf/90">
          Enviar pedido por WhatsApp
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          El pago se acuerda en el chat: efectivo, transferencia o contraentrega. El domicilio se confirma según el barrio.
        </p>
        {sent && (
          <div className="rounded-xl bg-accent p-3 text-sm text-wine" role="status">
            Se abrió WhatsApp con el pedido. Si no pasó,{" "}
            <a href={fallback} target="_blank" rel="noreferrer" className="font-medium underline">
              ábrelo desde aquí
            </a>
            . El pedido sigue guardado en este dispositivo por si hay que reenviarlo.
            <button type="button" className="mt-2 block underline" onClick={clear}>
              Vaciar pedido
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
