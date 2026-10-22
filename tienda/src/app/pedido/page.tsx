import type { Metadata } from "next"
import { Checkout } from "@/components/checkout"

export const metadata: Metadata = {
  title: "Pedido",
  description: "Revisa tu pedido de flores de limpiapipas y envíalo por WhatsApp.",
}

export default function OrderPage() {
  return <Checkout />
}
