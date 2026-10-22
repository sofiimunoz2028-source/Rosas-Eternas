import type { Metadata, Viewport } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { CartProvider } from "@/lib/cart"
import "./globals.css"

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600", "700"],
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
})

export const viewport: Viewport = {
  themeColor: "#6B1535",
  colorScheme: "light",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://rosas-eternas-olive.vercel.app"),
  title: {
    default: "Rosas Eternas",
    template: "%s · Rosas Eternas",
  },
  description:
    "Flores hechas a mano con limpiapipas. Catálogo con precios, personalización de colores y pedidos con tu celular.",
  applicationName: "Rosas Eternas",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Rosas Eternas",
    description:
      "Ramos, cajas y flores de limpiapipas. Elige colores, empaque y dedicatoria, y deja tu celular para el pedido.",
    locale: "es_CO",
    type: "website",
    images: ["/flores/hero-ramo.jpg"],
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${dm.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister()}))}).then(function(){if(window.caches)return caches.keys().then(function(keys){return Promise.all(keys.map(function(k){return caches.delete(k)}))})})}",
          }}
        />
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
        <span className="sr-only">El pedido pide el celular de quien compra y envía el aviso a la tienda.</span>
      </body>
    </html>
  )
}
