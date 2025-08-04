import { DocumentChunk } from "@/types/page";

export function generateIEEECitation(
  chunk: DocumentChunk,
  refNumber: number
): string {
  const title = chunk.documentName || "Untitled Document";

  return `[${refNumber}] ${title}`;
}

export function getReferenceNumber(
  chunks: DocumentChunk[],
  chunkId: string
): number {
  const index = chunks.findIndex((chunk) => chunk.id === chunkId);
  return index !== -1 ? index + 1 : 0;
}
