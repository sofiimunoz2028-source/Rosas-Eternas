import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { BlobPreconditionFailedError, get, put } from "@vercel/blob"
import type { CustomerDetails, OrderLine } from "@/lib/order"
import type { OrderStatus, Promotion, StoredOrder } from "@/lib/shop-types"

export type { OrderStatus, Promotion, StoredOrder }

type ShopState = {
  orders: StoredOrder[]
  promotions: Promotion[]
}

const EMPTY: ShopState = { orders: [], promotions: [] }
const BLOB_PATH = "shop/state.json"
const FILE_PATH = path.join(process.cwd(), "data", "shop-state.json")

let queue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>) {
  const run = queue.then(task, task)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function parseState(text: string): ShopState {
  try {
    const data = JSON.parse(text) as Partial<ShopState>
    return {
      orders: Array.isArray(data.orders) ? data.orders : [],
      promotions: Array.isArray(data.promotions) ? data.promotions : [],
    }
  } catch {
    return { orders: [], promotions: [] }
  }
}

async function readFileState(): Promise<{ state: ShopState; etag?: string }> {
  try {
    return { state: parseState(await readFile(FILE_PATH, "utf8")) }
  } catch {
    return { state: structuredClone(EMPTY) }
  }
}

async function writeFileState(state: ShopState) {
  await mkdir(path.dirname(FILE_PATH), { recursive: true })
  await writeFile(FILE_PATH, JSON.stringify(state))
}

async function readBlobState(): Promise<{ state: ShopState; etag?: string }> {
  const result = await get(BLOB_PATH, { access: "private", useCache: false })
  if (!result || result.statusCode !== 200 || !result.stream) return { state: structuredClone(EMPTY) }
  const text = await new Response(result.stream).text()
  return { state: parseState(text), etag: result.blob.etag }
}

async function writeBlobState(state: ShopState, etag?: string) {
  await put(BLOB_PATH, JSON.stringify(state), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    ifMatch: etag,
  })
}

function usesBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

async function mutate(change: (state: ShopState) => ShopState) {
  return enqueue(async () => {
    let lastError: unknown
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const current = usesBlob() ? await readBlobState() : await readFileState()
      const next = change(current.state)
      try {
        if (usesBlob()) await writeBlobState(next, current.etag)
        else await writeFileState(next)
        return next
      } catch (error) {
        lastError = error
        const retry =
          error instanceof BlobPreconditionFailedError ||
          (error instanceof Error && /exist|precondition|overwrite/i.test(error.message))
        if (!retry) throw error
      }
    }
    throw lastError
  })
}

export async function listOrders() {
  const current = usesBlob() ? await readBlobState() : await readFileState()
  return current.state.orders
}

export async function addOrder(input: { customer: CustomerDetails; lines: OrderLine[]; total: number }) {
  const order: StoredOrder = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "nuevo",
    customer: input.customer,
    lines: input.lines,
    total: input.total,
  }
  await mutate((state) => ({
    ...state,
    orders: [order, ...state.orders].slice(0, 200),
  }))
  return order
}

export async function deleteOrder(id: string) {
  await mutate((state) => ({
    ...state,
    orders: state.orders.filter((order) => order.id !== id),
  }))
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  let updated = false
  await mutate((state) => ({
    ...state,
    orders: state.orders.map((order) => {
      if (order.id !== id) return order
      updated = true
      return { ...order, status }
    }),
  }))
  return updated
}

export async function listPromotions(activeOnly = false) {
  const current = usesBlob() ? await readBlobState() : await readFileState()
  const promotions = current.state.promotions
  return activeOnly ? promotions.filter((promotion) => promotion.active) : promotions
}

export async function addPromotion(input: { title: string; detail: string }) {
  const promotion: Promotion = {
    id: crypto.randomUUID(),
    title: input.title,
    detail: input.detail,
    active: true,
    createdAt: new Date().toISOString(),
  }
  await mutate((state) => ({
    ...state,
    promotions: [promotion, ...state.promotions].slice(0, 30),
  }))
  return promotion
}

export async function updatePromotion(id: string, patch: { active?: boolean }) {
  let updated = false
  await mutate((state) => ({
    ...state,
    promotions: state.promotions.map((promotion) => {
      if (promotion.id !== id) return promotion
      updated = true
      return { ...promotion, ...patch }
    }),
  }))
  return updated
}

export async function deletePromotion(id: string) {
  await mutate((state) => ({
    ...state,
    promotions: state.promotions.filter((promotion) => promotion.id !== id),
  }))
}
