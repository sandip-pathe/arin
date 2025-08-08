// citation-utils.ts
import { Paragraph } from "@/types/page";

export function generateIEEECitation(
  para: Paragraph,
  refNumber: number
): string {
  // Extract first few words as a title
  const words = para.text.split(/\s+/).slice(0, 5).join(" ");
  const title = words.length > 0 ? `${words}...` : "Untitled Paragraph";

  return `[${refNumber}] ${title}`;
}

export function getReferenceNumber(
  paragraphs: Paragraph[],
  paraId: string
): number {
  const index = paragraphs.findIndex((para) => para.id === paraId);
  return index !== -1 ? index + 1 : 0;
}
