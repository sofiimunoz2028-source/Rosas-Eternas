import type { Metadata } from "next"
import { AdminPanel } from "@/components/admin-panel"

export const metadata: Metadata = {
  title: "Administrar",
  description: "Revisa pedidos y publica promociones de Rosas Eternas.",
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return <AdminPanel />
}
