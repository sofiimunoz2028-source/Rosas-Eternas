import type { Metadata } from "next"
import { CustomBuilder } from "@/components/custom-builder"

export const metadata: Metadata = {
  title: "Personalizar",
  description: "Arma un ramo de limpiapipas eligiendo flores, colores, tamaño, empaque y dedicatoria.",
}

export default function PersonalizePage() {
  return <CustomBuilder />
}
