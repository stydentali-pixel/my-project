import { runChat } from "@/lib/ai/providers";

export type DataFlowMode =
  | "text-clean"
  | "rag-chunks"
  | "qa-extract"
  | "jsonl-clean"
  | "quality-score"
  | "pipeline-plan";

export type DataFlowRecord = Record<string, unknown>;

export type DataFlowRunInput = {
  mode: DataFlowMode;
  input?: string;
  records?: DataFlowRecord[];
  provider?: string;
  chunkSize?: number;
  overlap?: number;
};

export type DataFlowPipelineInfo = {
  slug: DataFlowMode;
  name: string;
  description: string;
  inputType: "text" | "json" | "text-or-json";
  outputType: "json";
  aiRequired: boolean;
};

export const DATAFLOW_PIPELINES: DataFlowPipelineInfo[] = [
  {
    slug: "text-clean",
    name: "تنظيف النصوص",
    description: "إزالة التكرار والفراغات والرموز المزعجة وتجهيز النصوص العربية والإنجليزية للتدريب أو RAG.",
    inputType: "text",
    outputType: "json",
    aiRequired: false
  },
  {
    slug: "rag-chunks",
    name: "تجهيز RAG",
    description: "تقطيع النص إلى chunks منظمة مع معرفات وبيانات وصفية لاستخدامها في قواعد المتجهات والبحث الذكي.",
    inputType: "text",
    outputType: "json",
    aiRequired: false
  },
  {
    slug: "qa-extract",
    name: "استخراج أسئلة وأجوبة",
    description: "تحويل نص خام إلى أزواج سؤال/جواب بصيغة JSON لاستخدامها في قواعد معرفة أو تدريب SFT.",
    inputType: "text",
    outputType: "json",
    aiRequired: true
  },
  {
    slug: "jsonl-clean",
    name: "تنظيف JSON/JSONL",
    description: "توحيد السجلات وحذف الحقول الفارغة وإنتاج JSONL صالح للتصدير.",
    inputType: "json",
    outputType: "json",
    aiRequired: false
  },
  {
    slug: "quality-score",
    name: "تقييم جودة البيانات",
    description: "إعطاء درجات جودة قابلة للفهم للسجلات أو النصوص: الطول، النظافة، التكرار، اكتمال الحقول.",
    inputType: "text-or-json",
    outputType: "json",
    aiRequired: false
  },
  {
    slug: "pipeline-plan",
    name: "مخطط Pipeline بالذكاء الاصطناعي",
    description: "يبني خطة DataFlow مناسبة من وصف المستخدم، مستوحاة من فكرة operators وpipelines في OpenDCAI/DataFlow.",
    inputType: "text",
    outputType: "json",
    aiRequired: true
  }
];

function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function uniqueLines(text: string) {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const line of text.split("\n")) {
    const key = line.toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    lines.push(line);
  }
  return lines.join("\n");
}

function chunkText(text: string, chunkSize = 900, overlap = 120) {
  const clean = normalizeText(text);
  const chunks: Array<{ id: string; text: string; metadata: { index: number; chars: number } }> = [];
  let start = 0;
  let index = 0;
  const safeChunk = Math.max(200, Math.min(chunkSize, 4000));
  const safeOverlap = Math.max(0, Math.min(overlap, Math.floor(safeChunk / 2)));
  while (start < clean.length) {
    const end = Math.min(start + safeChunk, clean.length);
    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push({ id: `chunk_${String(index + 1).padStart(4, "0")}`, text: chunk, metadata: { index, chars: chunk.length } });
    index += 1;
    if (end >= clean.length) break;
    start = Math.max(0, end - safeOverlap);
  }
  return chunks;
}

function cleanRecord(record: DataFlowRecord) {
  const out: DataFlowRecord = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined || value === "") continue;
    out[key.trim()] = typeof value === "string" ? normalizeText(value) : value;
  }
  return out;
}

function toJsonl(records: DataFlowRecord[]) {
  return records.map((r) => JSON.stringify(r)).join("\n");
}

function scoreText(text: string) {
  const clean = normalizeText(text);
  const chars = clean.length;
  const lines = clean.split("\n").filter(Boolean);
  const unique = new Set(lines.map((l) => l.toLowerCase())).size;
  const duplicationRatio = lines.length ? 1 - unique / lines.length : 0;
  const hasArabic = /[\u0600-\u06FF]/.test(clean);
  const lengthScore = Math.min(100, Math.round((chars / 1200) * 100));
  const cleanlinessScore = Math.max(0, 100 - Math.round(duplicationRatio * 100));
  const structureScore = lines.length > 2 ? 80 : 45;
  const total = Math.round(lengthScore * 0.35 + cleanlinessScore * 0.4 + structureScore * 0.25);
  return { total, lengthScore, cleanlinessScore, structureScore, chars, lines: lines.length, duplicationRatio: Number(duplicationRatio.toFixed(3)), languageHint: hasArabic ? "ar" : "unknown-or-en" };
}

function parseRecords(input?: string, records?: DataFlowRecord[]) {
  if (records?.length) return records;
  if (!input?.trim()) return [];
  const trimmed = input.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return trimmed.split("\n").map((line, i) => ({ id: i + 1, text: line })).filter((r) => String(r.text).trim());
  }
}

async function aiJson(prompt: string, provider?: string) {
  const result = await runChat([
    { role: "system", content: "أنت محرك DataFlow. أعد JSON فقط بدون Markdown. يجب أن يكون الناتج قابلًا للقراءة آليًا." },
    { role: "user", content: prompt }
  ], provider);
  const raw = result.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return { provider: result.provider, model: result.model, data: JSON.parse(raw), raw };
  } catch {
    return { provider: result.provider, model: result.model, data: null, raw };
  }
}

export async function runDataFlow(input: DataFlowRunInput) {
  const started = Date.now();
  const mode = input.mode;
  if (mode === "text-clean") {
    const raw = input.input || "";
    const normalized = normalizeText(raw);
    const deduped = uniqueLines(normalized);
    return { ok: true, mode, output: { text: deduped, stats: scoreText(deduped) }, latencyMs: Date.now() - started };
  }

  if (mode === "rag-chunks") {
    const chunks = chunkText(input.input || "", input.chunkSize, input.overlap);
    return { ok: true, mode, output: { chunks, count: chunks.length }, latencyMs: Date.now() - started };
  }

  if (mode === "jsonl-clean") {
    const records = parseRecords(input.input, input.records).map(cleanRecord);
    return { ok: true, mode, output: { records, jsonl: toJsonl(records), count: records.length }, latencyMs: Date.now() - started };
  }

  if (mode === "quality-score") {
    const records = parseRecords(input.input, input.records);
    if (records.length > 0 && records.some((r) => Object.keys(r).length > 1)) {
      const scored = records.map((record, index) => ({ index, score: scoreText(JSON.stringify(record)), record }));
      return { ok: true, mode, output: { records: scored, average: Math.round(scored.reduce((a, r) => a + r.score.total, 0) / Math.max(1, scored.length)) }, latencyMs: Date.now() - started };
    }
    return { ok: true, mode, output: { score: scoreText(input.input || records.map((r) => r.text).join("\n")) }, latencyMs: Date.now() - started };
  }

  if (mode === "qa-extract") {
    const text = normalizeText(input.input || "").slice(0, 12000);
    const ai = await aiJson(`حوّل النص التالي إلى أزواج سؤال وجواب عالية الجودة. أعد JSON بهذا الشكل فقط: {"items":[{"question":"...","answer":"...","source_excerpt":"...","tags":["..."]}]}\n\nالنص:\n${text}`, input.provider);
    return { ok: true, mode, output: ai.data || { raw: ai.raw }, provider: ai.provider, model: ai.model, latencyMs: Date.now() - started };
  }

  if (mode === "pipeline-plan") {
    const ai = await aiJson(`صمّم خطة DataFlow قابلة للتنفيذ حسب طلب المستخدم. أعد JSON بهذا الشكل: {"goal":"...","operators":[{"name":"...","purpose":"...","input":"...","output":"..."}],"pipeline":["..."],"risks":["..."],"railway_notes":["..."]}\n\nطلب المستخدم:\n${input.input || ""}`, input.provider);
    return { ok: true, mode, output: ai.data || { raw: ai.raw }, provider: ai.provider, model: ai.model, latencyMs: Date.now() - started };
  }

  throw new Error(`Unsupported DataFlow mode: ${mode}`);
}

export function dataFlowCsv(rows: DataFlowRecord[]) {
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.map(esc).join(","), ...rows.map((row) => keys.map((k) => esc(row[k])).join(","))].join("\n");
}
