"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChoiceCards, ColorSwatches, QuantityStepper } from "@/components/choices"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart"
import {
  DEDICATION_MAX,
  MAX_QUANTITY,
  SIZES,
  defaultOptions,
  describeProduct,
  wrapsFor,
  type Product,
  type ProductOptions,
} from "@/lib/catalog"
import { formatCop } from "@/lib/order"

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [options, setOptions] = useState<ProductOptions>(() => defaultOptions(product))
  const [added, setAdded] = useState(false)
  const priced = useMemo(() => describeProduct(product, options), [product, options])
  const wraps = wrapsFor(product)

  function patch(partial: Partial<ProductOptions>) {
    setOptions((current) => ({ ...current, ...partial }))
  }

  function add() {
    addItem(priced)
    setAdded(true)
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 pb-28 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:py-12 md:pb-12">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted ring-1 ring-foreground/10">
        <Image
          src={product.image}
          alt={`${product.name}, flor de limpiapipas`}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{product.pieces} · hecho a mano con limpiapipas</p>
        <h1 className="mt-1 font-heading text-4xl text-wine">{product.name}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{product.description}</p>
        <p className="mt-4 font-heading text-3xl text-ink" aria-live="polite">
          {formatCop(priced.unitPrice * priced.quantity)}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCop(priced.unitPrice)} por arreglo, en el tamaño y empaque elegidos. La foto es una referencia.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            add()
          }}
        >
          <ColorSwatches
            multiple
            label="Colores de limpiapipas"
            value={options.colorIds}
            onChange={(colorIds) => patch({ colorIds })}
          />
          <ChoiceCards
            legend="Tamaño"
            value={options.sizeId}
            onChange={(sizeId) => patch({ sizeId })}
            options={SIZES.map((size) => ({
              id: size.id,
              title: size.name,
              detail: size.hint,
            }))}
          />
          <ChoiceCards
            legend="Empaque"
            value={options.wrapId}
            onChange={(wrapId) => patch({ wrapId })}
            options={wraps.map((wrap) => ({
              id: wrap.id,
              title: wrap.name,
              detail: wrap.price === 0 ? "Incluido" : `+ ${formatCop(wrap.price)}`,
            }))}
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="recipient">¿Para quién es?</Label>
              <Input
                id="recipient"
                value={options.recipient}
                maxLength={60}
                placeholder="Nombre de quien lo recibe"
                className="h-11"
                onChange={(event) => patch({ recipient: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <QuantityStepper
                label="cantidad"
                value={options.quantity}
                max={MAX_QUANTITY}
                onChange={(quantity) => patch({ quantity })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="dedication">Dedicatoria</Label>
              <span className="text-xs text-muted-foreground">
                {options.dedication.length}/{DEDICATION_MAX}
              </span>
            </div>
            <Textarea
              id="dedication"
              value={options.dedication}
              maxLength={DEDICATION_MAX}
              placeholder="El mensaje que va en la tarjeta"
              className="min-h-28"
              onChange={(event) => patch({ dedication: event.target.value })}
            />
          </div>

          <div className="hidden gap-3 md:flex">
            <Button type="submit" className="h-11 px-5">
              Agregar al pedido
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={() => {
                addItem(priced)
                router.push("/pedido")
              }}
            >
              Pedir ahora
            </Button>
          </div>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-heading text-xl">{formatCop(priced.unitPrice * priced.quantity)}</p>
          </div>
          <Button type="button" className="h-11 flex-1" onClick={add}>
            Agregar al pedido
          </Button>
        </div>
      </div>

      <Dialog open={added} onOpenChange={setAdded}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quedó en tu pedido</DialogTitle>
            <DialogDescription>
              {product.name} · {formatCop(priced.unitPrice * priced.quantity)}. En el siguiente paso te pedimos un celular para enviar el pedido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setAdded(false)}>
              Seguir mirando
            </Button>
            <Button onClick={() => router.push("/pedido")}>Ir al pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
