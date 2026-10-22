"use client"

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react"
import { MAX_QUANTITY } from "@/lib/catalog"
import { orderTotal, type OrderLine } from "@/lib/order"

const STORAGE_KEY = "rosas-eternas-pedido"

export type CartItem = OrderLine & {
  id: string
  image: string
}

type CartContextValue = {
  items: CartItem[]
  hydrated: boolean
  count: number
  total: number
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

const EMPTY: CartItem[] = []
let memory: CartItem[] = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function readStorage() {
  if (loaded) return memory
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return memory
    const parsed = JSON.parse(raw) as CartItem[]
    if (Array.isArray(parsed)) memory = parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return memory
}

function write(next: CartItem[]) {
  memory = next
  loaded = true
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getItems() {
  return readStorage()
}

function getServerItems() {
  return EMPTY
}

function getHydrated() {
  readStorage()
  return true
}

function getServerHydrated() {
  return false
}

function fingerprint(item: Omit<CartItem, "id" | "quantity">) {
  return JSON.stringify([item.name, item.image, item.unitPrice, item.summary])
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getItems, getServerItems)
  const hydrated = useSyncExternalStore(subscribe, getHydrated, getServerHydrated)

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      hydrated,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: orderTotal(items),
      addItem: (item) => {
        const key = fingerprint(item)
        const existing = items.find((entry) => fingerprint(entry) === key)
        if (!existing) {
          write([...items, { ...item, id: crypto.randomUUID() }])
          return
        }
        write(
          items.map((entry) =>
            entry.id === existing.id
              ? { ...entry, quantity: Math.min(MAX_QUANTITY, entry.quantity + item.quantity) }
              : entry,
          ),
        )
      },
      removeItem: (id) => write(items.filter((item) => item.id !== id)),
      setQuantity: (id, quantity) => {
        write(
          items.flatMap((item) => {
            if (item.id !== id) return [item]
            if (quantity < 1) return []
            return [{ ...item, quantity: Math.min(MAX_QUANTITY, quantity) }]
          }),
        )
      },
      clear: () => write([]),
    }
  }, [items, hydrated])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error("useCart debe usarse dentro de CartProvider")
  return value
}
