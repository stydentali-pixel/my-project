import { NextResponse } from "next/server";
import { z } from "zod";
import { pollinationsImageUrl } from "@/lib/ai/providers";

export const runtime = "nodejs";
const schema = z.object({ prompt: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const { prompt } = schema.parse(await request.json());
    return NextResponse.json({ ok: true, provider: "pollinations", imageUrl: pollinationsImageUrl(prompt) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
