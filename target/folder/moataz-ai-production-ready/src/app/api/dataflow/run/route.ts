import { NextResponse } from "next/server";
import { z } from "zod";
import { runDataFlow } from "@/lib/dataflow/pipelines";

export const runtime = "nodejs";

const schema = z.object({
  mode: z.enum(["text-clean", "rag-chunks", "qa-extract", "jsonl-clean", "quality-score", "pipeline-plan"]),
  input: z.string().optional(),
  records: z.array(z.record(z.unknown())).optional(),
  provider: z.string().optional(),
  chunkSize: z.number().optional(),
  overlap: z.number().optional()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await runDataFlow(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
