import { Paragraph } from "@/types/page";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const nlp = winkNLP(model);
const its = nlp.its;
const MAX_TOKENS_PER_BATCH = 10000;

/**
 * Converts raw text into structured Paragraph objects.
 * Each paragraph ≈200 words max, tagged with IDs + optional section title.
 */
export function processTextToParagraphs(
  text: string,
  documentIndex: number
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let globalParagraphIndex = 1;
  const sectionTitle = getSectionTitle(text);

  // Break into sentences
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences().out(its.value);

  let buffer: string[] = [];
  let wordCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceWordCount = sentence.split(/\s+/).length;

    // If buffer would exceed ~200 words, flush as a paragraph
    if (wordCount + sentenceWordCount > 200 && buffer.length > 0) {
      paragraphs.push({
        id: `d${documentIndex}.p${globalParagraphIndex++}`,
        text: buffer.join(" "),
        sectionTitle,
      });
      buffer = [];
      wordCount = 0;
    }

    buffer.push(sentence);
    wordCount += sentenceWordCount;
  }

  // Push last paragraph
  if (buffer.length > 0) {
    paragraphs.push({
      id: `d${documentIndex}.p${globalParagraphIndex++}`,
      text: buffer.join(" "),
      sectionTitle,
    });
  }

  return paragraphs;
}

/**
 * Groups Paragraphs into adaptive batches based on token budget.
 * (Uses rough heuristic: 1 token ≈ 4 chars).
 *
 * @param paragraphs - Array of Paragraphs
 * @param maxTokens - Max tokens per batch (default ~3000)
 * @returns Array of batches, each batch is an array of Paragraphs
 */

export function makeAdaptiveBatches(
  paragraphs: Paragraph[],
  maxTokens = MAX_TOKENS_PER_BATCH
): Paragraph[][] {
  const batches: Paragraph[][] = [];
  let current: Paragraph[] = [];
  let tokenCount = 0;

  for (const p of paragraphs) {
    const estTokens = Math.ceil(p.text.length / 4); // rough token estimate

    if (tokenCount + estTokens > maxTokens && current.length > 0) {
      batches.push(current);
      current = [];
      tokenCount = 0;
    }

    current.push(p);
    tokenCount += estTokens;
  }

  if (current.length > 0) batches.push(current);

  return batches;
}
/**
 * Detects a section title at the start of text (if any).
 */
function getSectionTitle(text: string): string | undefined {
  const match = text
    .substring(0, 200)
    .match(
      /^(SECTION|ARTICLE|CLAUSE|SUBSECTION|ACT|RULE)\s+([IVXLCDM0-9]+)[.)]?\s*([^\n]*)/i
    );
  if (!match) return undefined;

  const type = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
  const number = match[2];
  const rest = match[3]?.trim();
  return rest ? `${type} ${number} - ${rest}` : `${type} ${number}`;
}
