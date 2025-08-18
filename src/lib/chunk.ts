import { Paragraph } from "@/types/page";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const nlp = winkNLP(model);
const its = nlp.its;

/**
 * Processes raw text into structured Paragraph objects.
 * Splits into sentence-based chunks, capped at ~200 words max.
 *
 * @param text - The raw text to process.
 * @param documentIndex - The index of the document for ID generation.
 * @returns An array of Paragraph objects.
 */
export function processTextToParagraphs(
  text: string,
  documentIndex: number
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let globalParagraphIndex = 1;
  const sectionTitle = getSectionTitle(text);

  // Use NLP to get all sentences (since raw text has no \n\n cues)
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences().out(its.value);

  let buffer: string[] = [];
  let wordCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceWordCount = sentence.split(/\s+/).length;

    // If adding this sentence would push us >200 words, flush buffer first
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

  // Push any remaining sentences in buffer
  if (buffer.length > 0) {
    paragraphs.push({
      id: `d${documentIndex}.p${globalParagraphIndex++}`,
      text: buffer.join(" "),
      sectionTitle,
    });
  }

  return paragraphs;
}

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
