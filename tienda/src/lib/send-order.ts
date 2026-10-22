import { SHOP_PHONE } from "@/lib/order"

export async function deliverOrder(message: string): Promise<{ ok: true } | { ok: false }> {
  if (process.env.ORDER_SINK === "console") {
    console.log(message)
    return { ok: true }
  }

  const apikey = process.env.CALLMEBOT_APIKEY
  if (!apikey) {
    console.error("order delivery missing CALLMEBOT_APIKEY")
    return { ok: false }
  }

  const url = new URL("https://api.callmebot.com/whatsapp.php")
  url.searchParams.set("phone", SHOP_PHONE)
  url.searchParams.set("apikey", apikey)
  url.searchParams.set("text", message)

  try {
    const response = await fetch(url, { cache: "no-store" })
    const body = await response.text()
    const failed = !response.ok || /error|invalid|fail/i.test(body)
    if (failed) {
      console.error("order delivery failed", response.status, body.slice(0, 240))
      return { ok: false }
    }
    return { ok: true }
  } catch (error) {
    console.error("order delivery error", error)
    return { ok: false }
  }
}
