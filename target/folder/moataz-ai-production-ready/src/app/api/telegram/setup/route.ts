import { NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram/client";
import { publicBaseUrl } from "@/lib/utils/env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!process.env.ADMIN_PANEL_KEY || key !== process.env.ADMIN_PANEL_KEY) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN missing" }, { status: 400 });
  const webhookUrl = `${publicBaseUrl().replace(/\/$/, "")}/api/telegram/webhook`;
  const result = await setWebhook(webhookUrl);
  return NextResponse.json({ ok: true, webhookUrl, result });
}
