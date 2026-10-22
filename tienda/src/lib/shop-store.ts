import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise"
import type { CustomerDetails, OrderLine } from "@/lib/order"
import type { OrderStatus, Promotion, StoredOrder } from "@/lib/shop-types"

export type { OrderStatus, Promotion, StoredOrder }

type ShopState = {
  orders: StoredOrder[]
  promotions: Promotion[]
}

const EMPTY: ShopState = { orders: [], promotions: [] }
const FILE_PATH = path.join(process.cwd(), "data", "shop-state.json")
const ROW_ID = "main"

let queue: Promise<unknown> = Promise.resolve()
let pool: Pool | null = null
let ready: Promise<void> | null = null
let useSsl = process.env.MYSQL_SSL === "1"

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

function usesMysql() {
  return Boolean(process.env.MYSQL_ADDON_HOST)
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_ADDON_HOST,
      user: process.env.MYSQL_ADDON_USER,
      password: process.env.MYSQL_ADDON_PASSWORD,
      database: process.env.MYSQL_ADDON_DB,
      port: Number(process.env.MYSQL_ADDON_PORT || 3306),
      waitForConnections: true,
      connectionLimit: 2,
      connectTimeout: 10000,
      timezone: "Z",
      charset: "utf8mb4",
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    })
  }
  return pool
}

function sslRequired(error: unknown) {
  if (process.env.MYSQL_SSL === "0" || process.env.MYSQL_SSL === "1" || useSsl) return false
  const message = error instanceof Error ? error.message : ""
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : ""
  return code === "HANDSHAKE_SSL_ERROR" || code === "ER_SECURE_TRANSPORT_REQUIRED" || /ssl|secure transport|tls/i.test(message)
}

async function ensureMysql(): Promise<void> {
  if (!ready) {
    ready = (async (): Promise<void> => {
      const connection = await getPool().getConnection()
      try {
        await connection.query(
          `CREATE TABLE IF NOT EXISTS shop_admin_state (
            id VARCHAR(16) NOT NULL PRIMARY KEY,
            body MEDIUMTEXT NOT NULL
          ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        )
        await connection.query("INSERT IGNORE INTO shop_admin_state (id, body) VALUES (?, ?)", [
          ROW_ID,
          JSON.stringify(EMPTY),
        ])
      } finally {
        connection.release()
      }
    })().catch(async (error: unknown): Promise<void> => {
      ready = null
      if (!sslRequired(error)) throw error
      useSsl = true
      if (pool) {
        const closing = pool
        pool = null
        await closing.end().catch(() => undefined)
      }
      return ensureMysql()
    })
  }
  return ready
}

async function readFileState(): Promise<ShopState> {
  try {
    return parseState(await readFile(FILE_PATH, "utf8"))
  } catch {
    return structuredClone(EMPTY)
  }
}

async function writeFileState(state: ShopState) {
  await mkdir(path.dirname(FILE_PATH), { recursive: true })
  await writeFile(FILE_PATH, JSON.stringify(state))
}

async function readMysqlState(): Promise<ShopState> {
  await ensureMysql()
  const connection = await getPool().getConnection()
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT body FROM shop_admin_state WHERE id = ? LIMIT 1",
      [ROW_ID],
    )
    const body = rows[0]?.body
    return typeof body === "string" ? parseState(body) : structuredClone(EMPTY)
  } finally {
    connection.release()
  }
}

async function readState() {
  return usesMysql() ? readMysqlState() : readFileState()
}

async function mutate(change: (state: ShopState) => ShopState) {
  return enqueue(async () => {
    if (!usesMysql()) {
      const next = change(await readFileState())
      await writeFileState(next)
      return next
    }

    await ensureMysql()
    const connection = await getPool().getConnection()
    try {
      await connection.beginTransaction()
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT body FROM shop_admin_state WHERE id = ? FOR UPDATE",
        [ROW_ID],
      )
      const body = rows[0]?.body
      const current = typeof body === "string" ? parseState(body) : structuredClone(EMPTY)
      const next = change(current)
      const payload = JSON.stringify(next)
      const [updated] = await connection.query<ResultSetHeader>(
        "UPDATE shop_admin_state SET body = ? WHERE id = ?",
        [payload, ROW_ID],
      )
      if (updated.affectedRows === 0) {
        await connection.query("INSERT INTO shop_admin_state (id, body) VALUES (?, ?)", [ROW_ID, payload])
      }
      await connection.commit()
      return next
    } catch (error) {
      await connection.rollback().catch(() => undefined)
      throw error
    } finally {
      connection.release()
    }
  })
}

export async function listOrders() {
  return (await readState()).orders
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
  const promotions = (await readState()).promotions
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
