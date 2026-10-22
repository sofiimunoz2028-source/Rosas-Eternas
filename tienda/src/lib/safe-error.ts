export function safeError(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : "unknown"
  const secrets = [
    process.env.MYSQL_ADDON_PASSWORD,
    process.env.SHOP_ADMIN_SECRET,
    process.env.SHOP_ADMIN_PASSWORD,
    process.env.BLOB_READ_WRITE_TOKEN,
    process.env.JWT_SECRET,
    process.env.ADMIN_PASSWORD,
  ].filter((value): value is string => Boolean(value && value.length >= 4))
  let cleaned = message
  for (const secret of secrets) cleaned = cleaned.split(secret).join("[secret]")
  return cleaned.replace(/vercel_blob_rw_\S+/g, "[token]").slice(0, 220)
}
