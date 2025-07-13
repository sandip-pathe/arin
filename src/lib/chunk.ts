import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model'; 
import { v4 as uuidv4 } from 'uuid';

const nlp = winkNLP(model);

// Utility: Estimate token count roughly
const estimateTokens = (text: string) => Math.round(text.trim().split(/\s+/).length / 0.75);

export function chunkDocument(
  rawText: string,
  options: { maxChunkSize?: number } = {}
) {
  const { maxChunkSize = 4000 } = options;
  const minChunkSize = 3000;  
  const chunks: {
    id: string;
    content: string;
    sectionTitle?: string;
    tokenEstimate: number;
  }[] = [];

  // Always use legal segmentation for legal platform
  let segments: string[] = [];
  segments = rawText.split(/(?=\n\s*(?:SECTION|ARTICLE|CLAUSE|SUBSECTION|ACT|RULE)\s+[IVXLCDM0-9]+[.)]?\s)/gi);

  // Process each segment intelligently
  for (const segment of segments) {
    const segmentTokens = estimateTokens(segment);
    
    if (segmentTokens <= maxChunkSize && segmentTokens >= minChunkSize) {
      // Perfect size chunk
      chunks.push(createChunk(segment));
    } else if (segmentTokens > maxChunkSize) {
      // Break large segments using NLP
      breakLargeSegment(segment, minChunkSize, maxChunkSize).forEach(chunk => {
        chunks.push(chunk);
      });
    } else if (chunks.length > 0) {
      // Merge small segments with previous chunk if possible
      const lastChunk = chunks[chunks.length - 1];
      const mergedTokens = lastChunk.tokenEstimate + segmentTokens;
      
      if (mergedTokens <= maxChunkSize) {
        lastChunk.content += '\n\n' + segment;
        lastChunk.tokenEstimate = mergedTokens;
      } else {
        chunks.push(createChunk(segment));
      }
    } else {
      chunks.push(createChunk(segment));
    }
  }

  return chunks;

  // Helper to break large segments using NLP
  function breakLargeSegment(text: string, min: number, max: number) {
    const segmentChunks = [];
    const doc = nlp.readDoc(text);
    const sentences = doc.sentences().out();
    
    let currentChunk = '';
    let currentTokens = 0;
    let nextBreakPoint = -1;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = estimateTokens(sentence);
      
      // Detect potential break points (end of paragraphs, headings, etc.)
      const isBreakPoint = /[.:;!?]\s*$/.test(sentence) || 
                          (i < sentences.length - 1 && sentences[i+1].match(/^\s*[A-Z0-9]/));

      if (currentTokens + sentenceTokens > max && currentTokens >= min) {
        // Finalize chunk when reaching max size
        segmentChunks.push(createChunk(currentChunk));
        currentChunk = sentence;
        currentTokens = sentenceTokens;
      } else if (isBreakPoint && currentTokens >= min) {
        // Break at natural boundaries when over min size
        currentChunk += ' ' + sentence;
        currentTokens += sentenceTokens;
        segmentChunks.push(createChunk(currentChunk));
        currentChunk = '';
        currentTokens = 0;
        nextBreakPoint = i + 1;
      } else if (i === nextBreakPoint && currentTokens > 0) {
        // Force break if we passed a break point
        segmentChunks.push(createChunk(currentChunk));
        currentChunk = sentence;
        currentTokens = sentenceTokens;
      } else {
        // Continue accumulating
        currentChunk += currentChunk ? ' ' + sentence : sentence;
        currentTokens += sentenceTokens;
      }
    }

    // Add remaining content
    if (currentChunk) {
      segmentChunks.push(createChunk(currentChunk));
    }

    return segmentChunks;
  }

  // Helper to create chunk objects
  function createChunk(content: string) {
    return {
      id: uuidv4(),
      content: content.trim(),
      sectionTitle: getSectionTitle(content),
      tokenEstimate: estimateTokens(content),
    };
  }

  // Improved section title detection
  function getSectionTitle(text: string): string | undefined {
    const firstLine = text.split('\n')[0].trim();
    const match = firstLine.match(/^(?:(SECTION|ARTICLE|CLAUSE|SUBSECTION|ACT|RULE)\s+[IVXLCDM0-9]+[.)]?)/i);
    return match ? match[0] : undefined;
  }
}