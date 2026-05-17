import { splitIds } from "@/lib/utils/env";

export function isTelegramEnabled() {
  return process.env.TELEGRAM_ENABLED !== "false" && Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

export function isTelegramAdmin(id?: number | string) {
  if (!id) return false;
  const value = String(id);
  const owner = process.env.TELEGRAM_OWNER_ID;
  const admins = splitIds(process.env.TELEGRAM_ADMIN_IDS);
  return value === owner || admins.includes(value);
}

export function verifyTelegramSecret(headerValue: string | null) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return headerValue === expected;
}
