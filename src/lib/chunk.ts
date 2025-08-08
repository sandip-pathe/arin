import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import { v4 as uuidv4 } from "uuid";
import { DocumentChunk, Paragraph } from "@/types/page";

const nlp = winkNLP(model);

const estimateTokens = (text: string) =>
  Math.round(text.trim().split(/\s+/).length / 0.75);

export function chunkDocument(
  rawText: string,
  options: { maxChunkSize?: number; documentIndex?: number } = {}
): DocumentChunk[] {
  const { maxChunkSize = 8000, documentIndex = 1 } = options;
  const chunks: DocumentChunk[] = [];

  // First-pass segmentation
  const segments = rawText.split(
    /(?=\n\s*(?:SECTION|ARTICLE|CLAUSE|SUBSECTION|ACT|RULE)\s+[IVXLCDM0-9]+[.)]?\s)/gi
  );

  let chunkCounter = 1;

  for (const segment of segments) {
    const segmentTokens = estimateTokens(segment);

    if (segmentTokens <= maxChunkSize) {
      chunks.push(createLabeledChunk(segment, chunkCounter++));
    } else {
      const subChunks = optimizedSegmentSplit(segment, maxChunkSize);
      subChunks.forEach((text) => {
        chunks.push(createLabeledChunk(text, chunkCounter++));
      });
    }
  }

  return chunks;

  // Helper functions
  function optimizedSegmentSplit(text: string, maxSize: number): string[] {
    const chunks = [];
    let start = 0;
    let end = maxSize * 4; // Approximate character count

    while (start < text.length) {
      if (end >= text.length) {
        chunks.push(text.substring(start));
        break;
      }

      // Find safe break point (paragraph or sentence boundary)
      let breakIndex = Math.min(
        text.lastIndexOf("\n\n", end),
        text.lastIndexOf(". ", end),
        text.lastIndexOf("; ", end)
      );

      if (breakIndex <= start) {
        // Fallback to NLP only when necessary
        breakIndex = findNlpBreakPoint(text, start, end, maxSize);
      }

      chunks.push(text.substring(start, breakIndex).trim());
      start = breakIndex;
      end = start + maxSize * 4;
    }

    return chunks;
  }

  function findNlpBreakPoint(
    text: string,
    start: number,
    end: number,
    maxSize: number
  ): number {
    const slice = text.substring(start, Math.min(end + 100, text.length));
    const doc = nlp.readDoc(slice);
    const sentences = doc.sentences().out();
    let position = start;

    for (const sent of sentences) {
      position += sent.length;
      if (position - start > maxSize * 3) {
        return position;
      }
    }

    return end;
  }

  function createLabeledChunk(text: string, chunkIndex: number): DocumentChunk {
    return {
      id: uuidv4(),
      paragraphs: splitParagraphs(text, documentIndex, chunkIndex),
      sectionTitle: getSectionTitle(text),
      tokenEstimate: estimateTokens(text),
    };
  }

  function splitParagraphs(
    text: string,
    docIndex: number,
    chunkIndex: number
  ): Paragraph[] {
    return text
      .split(/\n{2,}/)
      .map((p, i) => ({
        id: `d${docIndex}.c${chunkIndex}.p${i + 1}`,
        text: p.trim(),
      }))
      .filter((p) => p.text);
  }

  function getSectionTitle(text: string): string | undefined {
    return text
      .substring(0, 100)
      .match(
        /^(SECTION|ARTICLE|CLAUSE|SUBSECTION|ACT|RULE)\s+[IVXLCDM0-9]+[.)]?/i
      )?.[0];
  }
}
