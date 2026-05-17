import { NextResponse } from "next/server";
import { providerStates } from "@/lib/ai/providers";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: process.env.APP_NAME || "Moataz AI",
    time: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    database: Boolean(process.env.DATABASE_URL),
    telegram: process.env.TELEGRAM_ENABLED !== "false" && Boolean(process.env.TELEGRAM_BOT_TOKEN),
    dataflow: process.env.DATAFLOW_ENABLED !== "false",
    dataflowWorker: Boolean(process.env.DATAFLOW_WORKER_URL),
    providers: providerStates().map((p) => ({ slug: p.slug, configured: p.configured, model: p.model }))
  });
}
