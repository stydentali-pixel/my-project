import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgent } from "@/lib/ai/agents";
import { runChat } from "@/lib/ai/providers";

export const runtime = "nodejs";

const schema = z.object({
  message: z.string().min(1),
  agent: z.string().optional(),
  provider: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const agent = getAgent(input.agent);
    const result = await runChat([
      { role: "system", content: agent.systemPrompt },
      { role: "user", content: input.message }
    ], input.provider);
    return NextResponse.json({ ok: true, agent: agent.slug, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
