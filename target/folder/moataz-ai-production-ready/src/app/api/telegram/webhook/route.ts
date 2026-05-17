import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/handlers";
import { isTelegramEnabled, verifyTelegramSecret } from "@/lib/telegram/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isTelegramEnabled()) return NextResponse.json({ ok: false, error: "Telegram disabled" }, { status: 503 });
    if (!verifyTelegramSecret(request.headers.get("x-telegram-bot-api-secret-token"))) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const update = await request.json();
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("telegram webhook error", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
