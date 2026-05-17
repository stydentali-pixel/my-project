import { NextResponse } from "next/server";
import { providerStates } from "@/lib/ai/providers";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ providers: providerStates() });
}
