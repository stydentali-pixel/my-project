import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgent } from "@/lib/ai/agents";
import { runChat } from "@/lib/ai/providers";

export const runtime = "nodejs";

const schema = z.object({ agent: z.string().default("general"), input: z.string().min(1), provider: z.string().optional() });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const agent = getAgent(body.agent);
    const result = await runChat([
      { role: "system", content: agent.systemPrompt },
      { role: "user", content: body.input }
    ], body.provider);
    return NextResponse.json({ ok: true, agent, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
