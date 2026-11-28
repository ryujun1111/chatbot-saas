// Text extraction for uploaded knowledge files (PDF, DOCX, TXT)

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

const PDF = "application/pdf";
const DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Browsers sometimes send an empty/generic MIME type, so fall back to the file extension
export function detectFileType(file: File): "pdf" | "docx" | "txt" | null {
  const name = file.name.toLowerCase();
  if (file.type === PDF || name.endsWith(".pdf")) return "pdf";
  if (file.type === DOCX || name.endsWith(".docx")) return "docx";
  if (
    file.type.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  )
    return "txt";
  return null;
}

export async function extractText(
  buffer: Buffer,
  type: "pdf" | "docx" | "txt",
): Promise<string> {
  if (type === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      return (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  }
  if (type === "docx") {
    const mammoth = await import("mammoth");
    return (await mammoth.extractRawText({ buffer })).value;
  }
  return buffer.toString("utf-8");
}
