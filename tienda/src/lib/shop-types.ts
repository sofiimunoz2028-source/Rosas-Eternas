import type { CustomerDetails, OrderLine } from "@/lib/order"

export type OrderStatus = "nuevo" | "revisado"

export type StoredOrder = {
  id: string
  createdAt: string
  status: OrderStatus
  customer: CustomerDetails
  lines: OrderLine[]
  total: number
}

export type Promotion = {
  id: string
  title: string
  detail: string
  active: boolean
  createdAt: string
}
