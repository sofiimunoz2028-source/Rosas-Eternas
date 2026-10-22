export type CategoryId = "rosas" | "ramos" | "cajas" | "detalles" | "otras"

export type Product = {
  slug: string
  name: string
  category: CategoryId
  price: number
  pieces: string
  summary: string
  description: string
  image: string
  featured?: boolean
  defaultColors: string[]
}

export type ProductOptions = {
  colorIds: string[]
  sizeId: string
  wrapId: string
  dedication: string
  recipient: string
  quantity: number
}

export const DEDICATION_MAX = 180
export const MAX_QUANTITY = 12
export const MAX_COLORS = 3
export const MAX_STEMS = 20

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: "rosas", name: "Rosas" },
  { id: "ramos", name: "Ramos" },
  { id: "cajas", name: "Cajas" },
  { id: "detalles", name: "Detalles" },
  { id: "otras", name: "Otras flores" },
]

export const COLORS = [
  { id: "vino", name: "Vino", hex: "#6B1535" },
  { id: "rojo", name: "Rojo", hex: "#C23B3B" },
  { id: "blush", name: "Rosa blush", hex: "#E7A8B8" },
  { id: "fucsia", name: "Fucsia", hex: "#E23D78" },
  { id: "durazno", name: "Durazno", hex: "#F0B592" },
  { id: "blanco", name: "Blanco", hex: "#F7F4EF" },
  { id: "crema", name: "Crema", hex: "#E7D3A8" },
  { id: "lila", name: "Lila", hex: "#C7B4DE" },
  { id: "azul", name: "Azul cielo", hex: "#9EC9E2" },
  { id: "amarillo", name: "Amarillo", hex: "#F0C93D" },
  { id: "verde", name: "Verde hoja", hex: "#2F6B4F" },
  { id: "cafe", name: "Café", hex: "#8A5A3A" },
] as const

const LIGHT_COLORS = new Set(["blush", "blanco", "crema", "durazno", "amarillo", "lila", "azul"])

export const SIZES = [
  { id: "mini", name: "Mini", hint: "Un poco más pequeño", multiplier: 0.8 },
  { id: "estandar", name: "Estándar", hint: "Como en la foto", multiplier: 1 },
  { id: "grande", name: "Grande", hint: "Más lleno", multiplier: 1.3 },
] as const

export const WRAPS = [
  { id: "foto", name: "Como en la foto", price: 0 },
  { id: "kraft", name: "Papel kraft", price: 0 },
  { id: "seda", name: "Papel de seda", price: 6000 },
  { id: "celofan", name: "Celofán", price: 8000 },
  { id: "caja", name: "Caja de regalo", price: 18000 },
] as const

export const FLOWERS = [
  {
    id: "rosa",
    name: "Rosa",
    price: 12000,
    image: "/flores/rosa-individual.jpg",
    defaultColor: "blush",
  },
  {
    id: "tulipan",
    name: "Tulipán",
    price: 14000,
    image: "/flores/ramo-tulipanes.jpg",
    defaultColor: "durazno",
  },
  {
    id: "girasol",
    name: "Girasol",
    price: 20000,
    image: "/flores/girasol.jpg",
    defaultColor: "amarillo",
  },
  {
    id: "gerbera",
    name: "Gerbera",
    price: 20000,
    image: "/flores/gerbera.jpg",
    defaultColor: "fucsia",
  },
  {
    id: "margarita",
    name: "Margarita",
    price: 16000,
    image: "/flores/margarita.jpg",
    defaultColor: "blanco",
  },
] as const

export type FlowerId = (typeof FLOWERS)[number]["id"]

export type FlowerSelection = {
  id: FlowerId
  count: number
  colorId: string
}

export const products: Product[] = [
  {
    slug: "rosa-individual",
    name: "Rosa eterna",
    category: "rosas",
    price: 18000,
    pieces: "1 rosa",
    summary: "Una rosa de limpiapipas con tallo largo y dos hojas.",
    description:
      "Se enrolla pétalo por pétalo en limpiapipas. Queda firme, con tallo y hojas, para regalar sola o poner en un florero. La foto es vino; tú eliges el color.",
    image: "/flores/rosa-individual.jpg",
    featured: true,
    defaultColors: ["vino"],
  },
  {
    slug: "mini-ramo",
    name: "Mini ramo blush",
    category: "ramos",
    price: 42000,
    pieces: "3 rosas",
    summary: "Tres rosas blush en papel kraft y listón vino.",
    description:
      "Un ramo pequeño, fácil de llevar. Tres rosas de limpiapipas, follaje verde y envoltura de kraft. Sirve para un detalle sin ocupar toda la mesa.",
    image: "/flores/mini-ramo.jpg",
    featured: true,
    defaultColors: ["blush"],
  },
  {
    slug: "ramo-clasico",
    name: "Ramo clásico rojo",
    category: "ramos",
    price: 72000,
    pieces: "6 rosas",
    summary: "Seis rosas rojas, compactas, sobre papel de seda.",
    description:
      "El ramo de seis, redondo y parejo. Cada rosa es de limpiapipas, con hojas verdes alrededor. En la foto va en rojo; puedes pedir otro color o mezclar hasta tres.",
    image: "/flores/ramo-clasico.jpg",
    featured: true,
    defaultColors: ["rojo"],
  },
  {
    slug: "ramo-buchon",
    name: "Ramo buchón",
    category: "ramos",
    price: 128000,
    pieces: "12 rosas",
    summary: "Doce rosas en vino y blush, con lazo dorado.",
    description:
      "El ramo lleno para cumpleaños, aniversario o una fecha que merece más flores. Doce rosas de limpiapipas, follaje y lazo. No se marchita después de la celebración.",
    image: "/flores/ramo-buchon.jpg",
    featured: true,
    defaultColors: ["vino", "blush"],
  },
  {
    slug: "caja-rosas",
    name: "Caja de nueve rosas",
    category: "cajas",
    price: 135000,
    pieces: "9 rosas",
    summary: "Nueve rosas en caja, con papel de seda.",
    description:
      "Nueve rosas acomodadas en caja: vino, blush y crema en la foto. Se entrega lista para abrir. Puedes unificar el color o repartir hasta tres tonos.",
    image: "/flores/caja-rosas.jpg",
    featured: true,
    defaultColors: ["vino", "blush", "crema"],
  },
  {
    slug: "ramo-pastel",
    name: "Ramo pastel",
    category: "ramos",
    price: 98000,
    pieces: "8 flores",
    summary: "Ocho flores en lila, azul, durazno y crema.",
    description:
      "Rosas y flores pequeñas en tonos suaves, envueltas en papel blanco con lazo lila. Un ramo claro para grado, baby shower o un escritorio.",
    image: "/flores/ramo-pastel.jpg",
    featured: true,
    defaultColors: ["lila", "azul", "durazno"],
  },
  {
    slug: "ramo-tulipanes",
    name: "Ramo de tulipanes",
    category: "ramos",
    price: 68000,
    pieces: "5 tulipanes",
    summary: "Cinco tulipanes en coral, durazno y crema.",
    description:
      "Tulipanes de copa, hechos con limpiapipas, en un ramo alto y envuelto en papel blanco. La foto mezcla coral y crema.",
    image: "/flores/ramo-tulipanes.jpg",
    defaultColors: ["durazno", "crema"],
  },
  {
    slug: "ramo-mixto",
    name: "Ramo mixto",
    category: "ramos",
    price: 86000,
    pieces: "6 flores",
    summary: "Rosas, girasol, tulipanes y una margarita.",
    description:
      "Un ramo variado: dos rosas vino, un girasol, dos tulipanes blush y una margarita blanca, en cono de kraft. Si quieres otra combinación, ármala en Personalizar.",
    image: "/flores/ramo-mixto.jpg",
    defaultColors: ["vino", "amarillo", "blush"],
  },
  {
    slug: "trio-girasoles",
    name: "Trío de girasoles",
    category: "ramos",
    price: 64000,
    pieces: "3 girasoles",
    summary: "Tres girasoles en kraft, atados con cordel.",
    description:
      "Tres girasoles de pétalo amarillo y centro café, con hojas verdes. Van en papel kraft. El amarillo se puede cambiar si prefieres otro tono.",
    image: "/flores/trio-girasoles.jpg",
    defaultColors: ["amarillo", "cafe"],
  },
  {
    slug: "girasol",
    name: "Girasol eterno",
    category: "otras",
    price: 24000,
    pieces: "1 girasol",
    summary: "Un girasol con centro café, tallo y hojas.",
    description:
      "Pétalos en lazo de limpiapipas, centro enrollado y tallo verde. Una flor grande, alegre y que se queda.",
    image: "/flores/girasol.jpg",
    defaultColors: ["amarillo"],
  },
  {
    slug: "gerbera",
    name: "Gerbera fucsia",
    category: "otras",
    price: 20000,
    pieces: "1 gerbera",
    summary: "Gerbera de pétalos en lazo y centro amarillo.",
    description:
      "Una gerbera sola, con muchos pétalos de limpiapipas y centro amarillo. En la foto es fucsia. Pide el color que combine con quien la recibe.",
    image: "/flores/gerbera.jpg",
    defaultColors: ["fucsia"],
  },
  {
    slug: "margarita",
    name: "Margarita blanca",
    category: "otras",
    price: 16000,
    pieces: "1 margarita",
    summary: "Margarita de pétalos blancos y centro amarillo.",
    description:
      "Pétalos blancos en lazo, centro amarillo y una hoja. Ligera, para acompañar otra flor o regalar sola.",
    image: "/flores/margarita.jpg",
    defaultColors: ["blanco", "amarillo"],
  },
  {
    slug: "detalle-tarjeta",
    name: "Rosa con tarjeta",
    category: "detalles",
    price: 28000,
    pieces: "1 rosa y tarjeta",
    summary: "Rosa blush, tarjeta en blanco y sobre kraft.",
    description:
      "Una rosa de limpiapipas con tarjeta para la dedicatoria y sobre de kraft. Escribes el mensaje en el pedido y lo pasamos a la tarjeta.",
    image: "/flores/detalle-tarjeta.jpg",
    defaultColors: ["blush"],
  },
]

export function categoryName(id: CategoryId) {
  return CATEGORIES.find((category) => category.id === id)?.name ?? id
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug)
}

export function colorById(id: string) {
  return COLORS.find((color) => color.id === id)
}

export function isLightColor(id: string) {
  return LIGHT_COLORS.has(id)
}

export function colorLabel(ids: string[]) {
  const names = ids.map((id) => colorById(id)?.name).filter(Boolean)
  return names.join(", ")
}

export function roundCop(value: number) {
  return Math.round(value / 1000) * 1000
}

export function wrapsFor(product: Product) {
  if (product.category === "cajas") {
    return WRAPS.filter((wrap) => wrap.id !== "caja")
  }
  return WRAPS
}

export function unitPrice(base: number, sizeId: string, wrapId: string) {
  const size = SIZES.find((item) => item.id === sizeId) ?? SIZES[1]
  const wrap = WRAPS.find((item) => item.id === wrapId) ?? WRAPS[0]
  return roundCop(base * size.multiplier) + wrap.price
}

export function defaultOptions(product: Product): ProductOptions {
  return {
    colorIds: product.defaultColors.slice(0, MAX_COLORS),
    sizeId: "estandar",
    wrapId: "foto",
    dedication: "",
    recipient: "",
    quantity: 1,
  }
}

export function describeProduct(product: Product, options: ProductOptions) {
  const size = SIZES.find((item) => item.id === options.sizeId) ?? SIZES[1]
  const allowedWraps = wrapsFor(product)
  const wrap = allowedWraps.find((item) => item.id === options.wrapId) ?? allowedWraps[0]
  const quantity = Math.min(MAX_QUANTITY, Math.max(1, options.quantity))
  const price = unitPrice(product.price, size.id, wrap.id)
  const summary = [
    `Colores: ${colorLabel(options.colorIds)}`,
    `Tamaño: ${size.name}`,
    `Empaque: ${wrap.name}${wrap.price ? ` (+${wrap.price.toLocaleString("es-CO")})` : ""}`,
  ]
  const recipient = options.recipient.trim()
  const dedication = options.dedication.trim()
  if (recipient) summary.push(`Para: ${recipient}`)
  if (dedication) summary.push(`Dedicatoria: ${dedication}`)
  return {
    name: product.name,
    image: product.image,
    quantity,
    unitPrice: price,
    summary,
  }
}

export function emptyFlowerSelections(): FlowerSelection[] {
  return FLOWERS.map((flower) => ({
    id: flower.id,
    count: 0,
    colorId: flower.defaultColor,
  }))
}

export function stemCount(selections: FlowerSelection[]) {
  return selections.reduce((sum, item) => sum + item.count, 0)
}

const FLOWER_PLURAL: Record<FlowerId, string> = {
  rosa: "rosas",
  tulipan: "tulipanes",
  girasol: "girasoles",
  gerbera: "gerberas",
  margarita: "margaritas",
}

function flowerPhrase(id: FlowerId, count: number) {
  const flower = FLOWERS.find((entry) => entry.id === id)
  const label = count === 1 ? flower?.name.toLowerCase() ?? "flor" : FLOWER_PLURAL[id]
  return `${count} ${label}`
}

export function describeCustom(
  selections: FlowerSelection[],
  sizeId: string,
  wrapId: string,
  recipient: string,
  dedication: string,
) {
  const chosen = selections.filter((item) => item.count > 0)
  const base = chosen.reduce((sum, item) => {
    const flower = FLOWERS.find((entry) => entry.id === item.id)
    return sum + (flower ? flower.price * item.count : 0)
  }, 0)
  const size = SIZES.find((item) => item.id === sizeId) ?? SIZES[1]
  const wrap = WRAPS.find((item) => item.id === wrapId) ?? WRAPS[0]
  const price = unitPrice(base, size.id, wrap.id)
  const summary = chosen.map(
    (item) => `${flowerPhrase(item.id, item.count)} (${colorById(item.colorId)?.name ?? item.colorId})`,
  )
  summary.push(`Tamaño: ${size.name}`, `Empaque: ${wrap.name}`)
  if (recipient.trim()) summary.push(`Para: ${recipient.trim()}`)
  if (dedication.trim()) summary.push(`Dedicatoria: ${dedication.trim()}`)
  const totalStems = stemCount(selections)
  const only = chosen.length === 1 ? chosen[0] : undefined
  const image = only
    ? (FLOWERS.find((flower) => flower.id === only.id)?.image ?? "/flores/hero-ramo.jpg")
    : "/flores/ramo-mixto.jpg"
  return {
    name: `Ramo personalizado de ${totalStems} ${totalStems === 1 ? "flor" : "flores"}`,
    image,
    quantity: 1,
    unitPrice: price,
    summary,
  }
}
