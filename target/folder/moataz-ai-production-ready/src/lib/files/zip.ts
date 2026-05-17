import JSZip from "jszip";

export type ZipFile = { path: string; content: string };

const allowedExtensions = [".txt", ".md", ".json", ".jsonl", ".csv", ".html", ".css", ".js", ".ts", ".tsx", ".env", ".example", ".yml", ".yaml"];

function safePath(path: string) {
  const cleaned = path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.\./g, "").trim();
  if (!cleaned) throw new Error("Invalid file path");
  const allowed = allowedExtensions.some((ext) => cleaned.endsWith(ext)) || cleaned.endsWith(".env.example");
  if (!allowed) throw new Error(`File type not allowed: ${cleaned}`);
  return cleaned;
}

export async function createZipBuffer(files: ZipFile[]) {
  if (!files.length) throw new Error("No files provided");
  const zip = new JSZip();
  for (const file of files) zip.file(safePath(file.path), file.content || "");
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export function parseZipText(text: string): ZipFile[] {
  const matches = [...text.matchAll(/FILE:\s*(.+?)\s*\nCONTENT:\s*\n([\s\S]*?)(?=\nFILE:|$)/gim)];
  return matches.map((m) => ({ path: m[1].trim(), content: m[2].trim() }));
}
