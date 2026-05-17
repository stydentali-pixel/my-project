import { NextResponse } from "next/server";
import { DATAFLOW_PIPELINES } from "@/lib/dataflow/pipelines";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, source: "OpenDCAI/DataFlow-inspired integration", pipelines: DATAFLOW_PIPELINES });
}
