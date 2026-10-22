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
  FLOWERS,
  MAX_STEMS,
  SIZES,
  WRAPS,
  describeCustom,
  emptyFlowerSelections,
  stemCount,
  type FlowerSelection,
} from "@/lib/catalog"
import { formatCop } from "@/lib/order"

export function CustomBuilder() {
  const router = useRouter()
  const { addItem } = useCart()
  const [selections, setSelections] = useState<FlowerSelection[]>(emptyFlowerSelections)
  const [sizeId, setSizeId] = useState("estandar")
  const [wrapId, setWrapId] = useState("kraft")
  const [recipient, setRecipient] = useState("")
  const [dedication, setDedication] = useState("")
  const [added, setAdded] = useState(false)
  const totalStems = stemCount(selections)
  const priced = useMemo(
    () => describeCustom(selections, sizeId, wrapId, recipient, dedication),
    [selections, sizeId, wrapId, recipient, dedication],
  )

  function update(id: FlowerSelection["id"], partial: Partial<FlowerSelection>) {
    setSelections((current) =>
      current.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    )
  }

  function add() {
    if (totalStems < 1) return
    addItem(priced)
    setAdded(true)
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 pb-28 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:py-12 md:pb-12">
      <div>
        <p className="text-sm font-medium text-rose">Personalizar</p>
        <h1 className="mt-1 font-heading text-4xl text-wine">Arma el ramo flor por flor</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Elige cuántas flores van, el color de limpiapipas de cada una, el tamaño y el empaque. Seis rosas estándar quedan en el mismo precio del ramo clásico.
        </p>

        <ul className="mt-6 space-y-3">
          {FLOWERS.map((flower) => {
            const selection = selections.find((item) => item.id === flower.id)
            const count = selection?.count ?? 0
            const colorId = selection?.colorId ?? flower.defaultColor
            return (
              <li key={flower.id} className="rounded-2xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
                <div className="flex gap-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24">
                    <Image src={flower.image} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-xl">{flower.name}</h2>
                        <p className="text-sm text-muted-foreground">{formatCop(flower.price)} cada una</p>
                      </div>
                      <QuantityStepper
                        label={flower.name}
                        min={0}
                        max={Math.min(12, MAX_STEMS - totalStems + count)}
                        value={count}
                        onChange={(next) => update(flower.id, { count: next })}
                      />
                    </div>
                  </div>
                </div>
                {count > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <ColorSwatches
                      label={`Color de ${flower.name.toLowerCase()}`}
                      value={[colorId]}
                      onChange={(ids) => update(flower.id, { colorId: ids[0] ?? colorId })}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <aside className="h-fit rounded-3xl bg-card p-5 ring-1 ring-foreground/10 md:sticky md:top-24">
        <h2 className="font-heading text-2xl text-wine">Tu ramo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalStems === 0
            ? "Todavía no hay flores."
            : `${totalStems} ${totalStems === 1 ? "flor" : "flores"} de limpiapipas.`}
        </p>
        <div className="mt-4 space-y-5">
          <ChoiceCards
            legend="Tamaño del ramo"
            value={sizeId}
            onChange={setSizeId}
            options={SIZES.map((size) => ({ id: size.id, title: size.name, detail: size.hint }))}
          />
          <ChoiceCards
            legend="Empaque"
            value={wrapId}
            onChange={setWrapId}
            options={WRAPS.filter((wrap) => wrap.id !== "foto").map((wrap) => ({
              id: wrap.id,
              title: wrap.name,
              detail: wrap.price === 0 ? "Incluido" : `+ ${formatCop(wrap.price)}`,
            }))}
          />
          <div className="space-y-2">
            <Label htmlFor="custom-recipient">¿Para quién es?</Label>
            <Input
              id="custom-recipient"
              value={recipient}
              maxLength={60}
              className="h-11"
              placeholder="Nombre de quien lo recibe"
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="custom-note">Dedicatoria</Label>
              <span className="text-xs text-muted-foreground">
                {dedication.length}/{DEDICATION_MAX}
              </span>
            </div>
            <Textarea
              id="custom-note"
              value={dedication}
              maxLength={DEDICATION_MAX}
              className="min-h-24"
              placeholder="El mensaje de la tarjeta"
              onChange={(event) => setDedication(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-5 font-heading text-3xl" aria-live="polite">
          {formatCop(priced.unitPrice)}
        </p>
        <Button type="button" className="mt-4 h-11 w-full" disabled={totalStems < 1} onClick={add}>
          Agregar al pedido
        </Button>
        <Button
          type="button"
          variant="outline"
          className="mt-2 h-11 w-full"
          disabled={totalStems < 1}
          onClick={() => {
            addItem(priced)
            router.push("/pedido")
          }}
        >
          Pedir ahora
        </Button>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {totalStems === 0 ? "Sin flores" : `${totalStems} ${totalStems === 1 ? "flor" : "flores"}`}
            </p>
            <p className="font-heading text-xl">{formatCop(priced.unitPrice)}</p>
          </div>
          <Button type="button" className="h-11 flex-1" disabled={totalStems < 1} onClick={add}>
            Agregar al pedido
          </Button>
        </div>
      </div>

      <Dialog open={added} onOpenChange={setAdded}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ramo listo para pedir</DialogTitle>
            <DialogDescription>
              {priced.name} · {formatCop(priced.unitPrice)}. Revisa los datos y deja el celular para enviar el pedido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdded(false)}>
              Seguir armando
            </Button>
            <Button onClick={() => router.push("/pedido")}>Ir al pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
