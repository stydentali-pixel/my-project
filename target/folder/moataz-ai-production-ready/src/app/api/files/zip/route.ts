import { NextResponse } from "next/server";
import { z } from "zod";
import { createZipBuffer } from "@/lib/files/zip";

export const runtime = "nodejs";
const schema = z.object({ files: z.array(z.object({ path: z.string().min(1), content: z.string().default("") })).min(1) });

export async function POST(request: Request) {
  try {
    if (process.env.ZIP_ENABLED === "false") return NextResponse.json({ ok: false, error: "ZIP disabled" }, { status: 403 });
    const input = schema.parse(await request.json());
    const buffer = await createZipBuffer(input.files);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="moataz-ai-${Date.now()}.zip"`
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
