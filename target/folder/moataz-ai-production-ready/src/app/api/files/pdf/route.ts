import { NextResponse } from "next/server";
import { z } from "zod";
import { createPdfBuffer } from "@/lib/files/pdf";

export const runtime = "nodejs";
const schema = z.object({ title: z.string().optional(), content: z.string().min(1), author: z.string().optional() });

export async function POST(request: Request) {
  try {
    if (process.env.PDF_ENABLED === "false") return NextResponse.json({ ok: false, error: "PDF disabled" }, { status: 403 });
    const input = schema.parse(await request.json());
    const buffer = await createPdfBuffer(input);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="moataz-ai-${Date.now()}.pdf"`
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
