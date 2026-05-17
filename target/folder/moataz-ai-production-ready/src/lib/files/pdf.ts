import PDFDocument from "pdfkit";

export type PdfInput = { title?: string; content: string; author?: string };

export function createPdfBuffer(input: PdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: input.title || "Moataz AI PDF" } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(input.title || "Moataz AI Document", { align: "right" });
    doc.moveDown(0.5);
    doc.fontSize(9).text(new Date().toISOString(), { align: "right" });
    if (input.author) doc.text(`Author: ${input.author}`, { align: "right" });
    doc.moveDown(1);
    doc.fontSize(12).text(input.content, { align: "right", lineGap: 6 });
    doc.end();
  });
}

export function parsePdfText(text: string): PdfInput {
  const titleMatch = text.match(/العنوان\s*:\s*(.+)/i) || text.match(/title\s*:\s*(.+)/i);
  const contentMatch = text.match(/المحتوى\s*:\s*([\s\S]+)/i) || text.match(/content\s*:\s*([\s\S]+)/i);
  return {
    title: titleMatch?.[1]?.trim() || "Moataz AI Document",
    content: contentMatch?.[1]?.trim() || text.trim()
  };
}
