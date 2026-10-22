import type { Metadata } from "next"
import { Checkout } from "@/components/checkout"

export const metadata: Metadata = {
  title: "Pedido",
  description: "Revisa tu pedido de flores de limpiapipas y déjanos un celular para confirmarlo.",
}

export default function OrderPage() {
  return <Checkout />
}
