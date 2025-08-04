import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import { v4 as uuidv4 } from "uuid";
import { DocumentChunk, Paragraph } from "@/types/page";

const nlp = winkNLP(model);

const estimateTokens = (text: string) =>
  Math.round(text.trim().split(/\s+/).length / 0.75);

export function chunkDocument(
  rawText: string,
  options: { maxChunkSize?: number } = {}
): DocumentChunk[] {
  const { maxChunkSize = 4000 } = options;
  const minChunkSize = 3000;
  const chunks: DocumentChunk[] = [];

  let segments: string[] = rawText.split(
    /(?=\n\s*(?:SECTION|ARTICLE|CLAUSE|SUBSECTION|ACT|RULE)\s+[IVXLCDM0-9]+[.)]?\s)/gi
  );

  let chunkCounter = 1;

  for (const segment of segments) {
    const segmentTokens = estimateTokens(segment);

    if (segmentTokens <= maxChunkSize && segmentTokens >= minChunkSize) {
      chunks.push(createLabeledChunk(segment, chunkCounter++));
    } else if (segmentTokens > maxChunkSize) {
      const brokenChunks = breakLargeSegment(
        segment,
        minChunkSize,
        maxChunkSize
      );
      for (const text of brokenChunks) {
        chunks.push(createLabeledChunk(text, chunkCounter++));
      }
    } else if (chunks.length > 0) {
      const last = chunks[chunks.length - 1];
      const extraParagraphs = splitAndLabelParagraphs(
        segment,
        chunkCounter - 1,
        last.paragraphs.length + 1
      );
      last.paragraphs.push(...extraParagraphs);
      last.tokenEstimate += estimateTokens(segment);
    } else {
      chunks.push(createLabeledChunk(segment, chunkCounter++));
    }
  }

  console.log(`Total chunks created: ${chunks.length}`);
  console.log(`chunks`, chunks);
  return chunks;

  function breakLargeSegment(text: string, min: number, max: number): string[] {
    const doc = nlp.readDoc(text);
    const sentences = doc.sentences().out();

    const result: string[] = [];
    let currentChunk = "";
    let currentTokens = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = estimateTokens(sentence);
      const isBreakPoint =
        /[.:;!?]\s*$/.test(sentence) ||
        (i < sentences.length - 1 && sentences[i + 1].match(/^\s*[A-Z0-9]/));

      if (currentTokens + sentenceTokens > max && currentTokens >= min) {
        result.push(currentChunk.trim());
        currentChunk = sentence;
        currentTokens = sentenceTokens;
      } else if (isBreakPoint && currentTokens >= min) {
        currentChunk += " " + sentence;
        currentTokens += sentenceTokens;
        result.push(currentChunk.trim());
        currentChunk = "";
        currentTokens = 0;
      } else {
        currentChunk += currentChunk ? " " + sentence : sentence;
        currentTokens += sentenceTokens;
      }
    }

    if (currentChunk) {
      result.push(currentChunk.trim());
    }

    return result;
  }

  function createLabeledChunk(text: string, chunkIndex: number): DocumentChunk {
    const paragraphs = splitAndLabelParagraphs(text, chunkIndex);
    return {
      id: uuidv4(),
      paragraphs,
      sectionTitle: getSectionTitle(text),
      tokenEstimate: estimateTokens(text),
    };
  }

  function splitAndLabelParagraphs(
    text: string,
    chunkIndex: number,
    startFrom: number = 1
  ): Paragraph[] {
    const rawParagraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    return rawParagraphs.map((para, i) => ({
      id: `c${chunkIndex}.p${i + startFrom}`,
      text: para,
    }));
  }

  function getSectionTitle(text: string): string | undefined {
    const firstLine = text.split("\n")[0].trim();
    const match = firstLine.match(
      /^(?:(SECTION|ARTICLE|CLAUSE|SUBSECTION|ACT|RULE)\s+[IVXLCDM0-9]+[.)]?)/i
    );
    return match ? match[0] : undefined;
  }
}
