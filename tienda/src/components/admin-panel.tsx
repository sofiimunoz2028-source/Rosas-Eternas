"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { displayPhone, formatCop, formatDate, normalizePhone } from "@/lib/order"
import type { Promotion, StoredOrder } from "@/lib/shop-types"

function when(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(iso))
}

function phoneLabel(value: string) {
  const local = normalizePhone(value)
  return local ? displayPhone(local) : value
}

export function AdminPanel() {
  const [phase, setPhase] = useState<"loading" | "login" | "desk">("loading")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [entering, setEntering] = useState(false)
  const [orders, setOrders] = useState<StoredOrder[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loadError, setLoadError] = useState("")
  const [title, setTitle] = useState("")
  const [detail, setDetail] = useState("")
  const [promoError, setPromoError] = useState("")
  const [savingPromo, setSavingPromo] = useState(false)

  async function loadDesk() {
    const [orderResponse, promoResponse] = await Promise.all([
      fetch("/api/pedidos"),
      fetch("/api/admin/promociones"),
    ])
    if (!orderResponse.ok || !promoResponse.ok) {
      setLoadError("No se pudo cargar el escritorio.")
      return
    }
    const orderData = (await orderResponse.json()) as { orders: StoredOrder[] }
    const promoData = (await promoResponse.json()) as { promotions: Promotion[] }
    setOrders(orderData.orders)
    setPromotions(promoData.promotions)
    setLoadError("")
  }

  useEffect(() => {
    let cancelled = false
    async function openSession() {
      try {
        const response = await fetch("/api/admin/session")
        const data = (await response.json().catch(() => null)) as { ok?: boolean } | null
        if (cancelled) return
        if (data?.ok) {
          await loadDesk()
          if (!cancelled) setPhase("desk")
          return
        }
      } catch {
        if (cancelled) return
      }
      setPhase("login")
    }
    void openSession()
    return () => {
      cancelled = true
    }
  }, [])

  async function enter(event: FormEvent) {
    event.preventDefault()
    setEntering(true)
    setLoginError("")
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setLoginError(data?.error || "La contraseña no coincide.")
        return
      }
      setPassword("")
      setPhase("desk")
      await loadDesk()
    } catch {
      setLoginError("No pudimos comprobar la contraseña. Inténtalo otra vez.")
    } finally {
      setEntering(false)
    }
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <p className="text-muted-foreground">Cargando administración…</p>
      </div>
    )
  }

  if (phase === "login") {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <p className="text-sm font-medium tracking-wide text-rose uppercase">Rosas Eternas</p>
        <h1 className="mt-2 font-heading text-4xl text-wine">Administrar</h1>
        <p className="mt-2 text-muted-foreground">Entra para ver los pedidos y publicar promociones.</p>
        <form className="mt-6 space-y-4" onSubmit={enter}>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              className="h-11"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {loginError && <p className="text-sm text-destructive">{loginError}</p>}
          <Button type="submit" className="h-11 w-full" disabled={entering}>
            {entering ? "Comprobando…" : "Entrar"}
          </Button>
        </form>
      </div>
    )
  }

  async function removeOrder(id: string) {
    const response = await fetch(`/api/pedidos/${id}`, { method: "DELETE" })
    if (!response.ok) return
    setOrders((current) => current.filter((item) => item.id !== id))
  }

  async function mark(order: StoredOrder) {
    const status = order.status === "nuevo" ? "revisado" : "nuevo"
    const response = await fetch(`/api/pedidos/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) return
    setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status } : item)))
  }

  async function publish(event: FormEvent) {
    event.preventDefault()
    setSavingPromo(true)
    setPromoError("")
    try {
      const response = await fetch("/api/admin/promociones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, detail }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string; promotion?: Promotion } | null
      if (!response.ok || !data?.promotion) {
        setPromoError(data?.error || "No se pudo guardar la promoción.")
        return
      }
      setPromotions((current) => [data.promotion as Promotion, ...current])
      setTitle("")
      setDetail("")
    } catch {
      setPromoError("No se pudo guardar la promoción.")
    } finally {
      setSavingPromo(false)
    }
  }

  async function togglePromo(promotion: Promotion) {
    const response = await fetch(`/api/admin/promociones/${promotion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !promotion.active }),
    })
    if (!response.ok) return
    setPromotions((current) =>
      current.map((item) => (item.id === promotion.id ? { ...item, active: !item.active } : item)),
    )
  }

  async function removePromo(id: string) {
    const response = await fetch(`/api/admin/promociones/${id}`, { method: "DELETE" })
    if (!response.ok) return
    setPromotions((current) => current.filter((item) => item.id !== id))
  }

  async function leave() {
    await fetch("/api/admin/logout", { method: "POST" })
    setPhase("login")
    setOrders([])
    setPromotions([])
  }

  const fresh = orders.filter((order) => order.status === "nuevo").length

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium tracking-wide text-rose uppercase">Escritorio</p>
          <h1 className="font-heading text-4xl text-wine">Administrar</h1>
          <p className="mt-1 text-muted-foreground">
            {fresh === 0 ? "No hay pedidos nuevos." : `${fresh} ${fresh === 1 ? "pedido nuevo" : "pedidos nuevos"}.`}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={leave}>
          Salir
        </Button>
      </div>
      {loadError && <p className="mt-4 text-sm text-destructive">{loadError}</p>}

      <section className="mt-8">
        <h2 className="font-heading text-3xl">Pedidos</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-muted-foreground">Cuando alguien envíe un pedido, aparece aquí con su celular.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-2xl">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {phoneLabel(order.customer.phone)} · {order.customer.place}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {when(order.createdAt)}
                      {order.customer.date ? ` · Lo necesita el ${formatDate(order.customer.date)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-2xl">{formatCop(order.total)}</p>
                    <p className="text-xs tracking-wide text-rose uppercase">
                      {order.status === "nuevo" ? "Nuevo" : "Revisado"}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {order.lines.map((line, index) => (
                    <li key={`${order.id}-${index}`}>
                      <span className="font-medium">
                        {line.name} × {line.quantity}
                      </span>
                      <span className="text-muted-foreground"> — {formatCop(line.unitPrice * line.quantity)}</span>
                      {line.summary.length > 0 && (
                        <span className="block text-muted-foreground">{line.summary.join(" · ")}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {order.customer.notes && <p className="mt-2 text-sm">Nota: {order.customer.notes}</p>}
                <div className="mt-3 flex gap-2">
                  <Button type="button" variant="outline" onClick={() => mark(order)}>
                    {order.status === "nuevo" ? "Marcar revisado" : "Marcar como nuevo"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => removeOrder(order.id)}>
                    Quitar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-3xl">Promociones</h2>
        <p className="mt-1 text-muted-foreground">Las activas se ven en la página de inicio y en el catálogo.</p>
        <form className="mt-4 grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10" onSubmit={publish}>
          <div className="space-y-2">
            <Label htmlFor="promo-title">Título</Label>
            <Input
              id="promo-title"
              value={title}
              maxLength={80}
              placeholder="Ejemplo: 2 ramos mini por $90.000"
              className="h-11"
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-detail">Detalle</Label>
            <Textarea
              id="promo-detail"
              value={detail}
              maxLength={240}
              placeholder="Hasta qué fecha, qué incluye o cómo se pide"
              onChange={(event) => setDetail(event.target.value)}
            />
          </div>
          {promoError && <p className="text-sm text-destructive">{promoError}</p>}
          <Button type="submit" className="h-11 w-full sm:w-auto" disabled={savingPromo}>
            {savingPromo ? "Guardando…" : "Publicar promoción"}
          </Button>
        </form>
        {promotions.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Todavía no hay promociones.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {promotions.map((promotion) => (
              <li key={promotion.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <div>
                  <p className="font-heading text-xl">{promotion.title}</p>
                  {promotion.detail && <p className="mt-1 text-sm text-muted-foreground">{promotion.detail}</p>}
                  <p className="mt-1 text-xs tracking-wide text-rose uppercase">
                    {promotion.active ? "Activa" : "Pausada"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => togglePromo(promotion)}>
                    {promotion.active ? "Pausar" : "Activar"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => removePromo(promotion.id)}>
                    Quitar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
