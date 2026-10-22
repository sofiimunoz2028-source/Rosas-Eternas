import Image from "next/image"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { WhatsAppButton } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { products } from "@/lib/catalog"
import { WHATSAPP_DISPLAY, WHATSAPP_HELLO } from "@/lib/order"
import { cn } from "cn"

const featured = products.filter((product) => product.featured)

const steps = [
  {
    title: "Elige el modelo",
    text: "Un ramo del catálogo o un ramo armado flor por flor.",
  },
  {
    title: "Personalízalo",
    text: "Colores de limpiapipas, tamaño, empaque y la dedicatoria de la tarjeta.",
  },
  {
    title: "Pide por WhatsApp",
    text: `El mensaje sale listo al ${WHATSAPP_DISPLAY}, con el total y los datos de entrega.`,
  },
]

const questions = [
  {
    q: "¿Son flores naturales?",
    a: "No. Cada pétalo es limpiapipas, enrollado a mano. El color se queda y no hay que ponerlas en agua.",
  },
  {
    q: "¿La foto es el color final?",
    a: "La foto muestra el modelo. En el pedido eliges los colores. Se pueden mezclar hasta tres en un arreglo del catálogo, o un color por tipo de flor si lo armas tú.",
  },
  {
    q: "¿Cómo se paga y se entrega?",
    a: "Por WhatsApp se acuerda efectivo, transferencia o contraentrega. El domicilio se confirma según la ciudad y el barrio.",
  },
]

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div>
          <p className="text-sm font-medium tracking-wide text-rose uppercase">Hechas con limpiapipas</p>
          <h1 className="mt-3 font-heading text-5xl leading-[1.05] text-wine md:text-6xl">
            Rosas que duran más que el instante
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
            Ramos, cajas y flores sueltas hechas a mano. Elige color, empaque y dedicatoria, mira el precio y manda el pedido por WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/catalogo" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
              Ver catálogo
            </Link>
            <Link
              href="/personalizar"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
            >
              Armar mi ramo
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            También puedes escribir directo al{" "}
            <a href={WHATSAPP_HELLO} className="font-medium text-wine underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {WHATSAPP_DISPLAY}
            </a>
            .
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted ring-1 ring-foreground/10 md:aspect-[5/4]">
          <Image
            src="/flores/hero-ramo.jpg"
            alt="Ramo de rosas de limpiapipas en vino, rosa blush y crema"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-wine">Destacados</h2>
            <p className="mt-1 text-sm text-muted-foreground">Precios del modelo como sale en la foto.</p>
          </div>
          <Link href="/catalogo" className="text-sm font-medium text-rose hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title}>
              <p className="font-heading text-3xl text-gold">0{index + 1}</p>
              <h2 className="mt-2 font-heading text-2xl">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-muted">
          <Image
            src="/flores/ramo-pastel.jpg"
            alt="Ramo pastel de flores de limpiapipas"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-heading text-4xl text-wine">Un ramo que no está en la foto</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Junta rosas, tulipanes, girasoles, gerberas y margaritas. Cada flor lleva su color, y el total se actualiza antes de enviar el pedido.
          </p>
          <Link href="/personalizar" className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 px-5")}>
            Personalizar flores
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <h2 className="font-heading text-3xl text-wine">Antes de pedir</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {questions.map((item) => (
            <article key={item.q} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              <h3 className="font-heading text-xl">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-wine px-6 py-6 text-primary-foreground">
          <div>
            <p className="font-heading text-3xl">¿Ya sabes qué flores quieres?</p>
            <p className="mt-1 text-sm text-primary-foreground/80">Escríbenos y armamos el pedido en el chat.</p>
          </div>
          <WhatsAppButton href={WHATSAPP_HELLO}>WhatsApp {WHATSAPP_DISPLAY}</WhatsAppButton>
        </div>
      </section>
    </>
  )
}
