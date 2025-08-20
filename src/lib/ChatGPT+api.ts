import { OpenAI } from "openai";
import { Paragraph, SummaryItem } from "@/types/page";
import { useAuthStore } from "@/store/auth-store";
import { endTimer, logPerf, startTimer } from "./hi";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const BATCH_SIZE = 100;

/**
 * Main entrypoint
 * - Processes paragraphs in batches
 * - Consolidates into one final result
 */
export async function summarizeParagraphs(
  paragraphs: Paragraph[],
  progressCallback?: (percent: number) => void
): Promise<SummaryItem> {
  const summarizeTimer = startTimer("OpenAISummarization");
  logPerf("Starting summarization", {
    paragraphCount: paragraphs.length,
    totalCharacters: paragraphs.reduce((sum, p) => sum + p.text.length, 0),
  });

  const settings = useAuthStore.getState().settings.summary;

  try {
    const batchResult: any[] = [];

    for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
      const batchTimer = startTimer(`BatchProcessing-${i}-${i + BATCH_SIZE}`);
      const batch = paragraphs.slice(i, i + BATCH_SIZE);

      logPerf("Processing batch", {
        batchIndex: i,
        batchSize: batch.length,
        batchCharacterCount: batch.reduce((sum, p) => sum + p.text.length, 0),
      });

      const result = await processBatch(batch, settings);
      batchResult.push(result);
      endTimer(batchTimer);

      if (progressCallback) {
        progressCallback(
          Math.min(
            100,
            Math.round(((i + batch.length) / paragraphs.length) * 100)
          )
        );
      }
    }

    logPerf("All batches completed", { totalBatches: batchResult.length });
    return await aggregateResults(batchResult, settings);
  } catch (error: any) {
    logPerf("Summarization failed", { error: error.message });
    throw error;
  } finally {
    endTimer(summarizeTimer);
  }
}

/**
 * Step 1: Chunk summaries
 * Each batch produces a partial summary and ontology candidates
 */
async function processBatch(paragraphs: Paragraph[], settings: any) {
  const batchTimer = startTimer(`OpenAIBatch-${paragraphs[0]?.id}`);
  try {
    logPerf("Sending to OpenAI", { paragraphCount: paragraphs.length });
    const paragraphText = paragraphs
      .map((p) => `(${p.id}) ${p.text}`)
      .join("\n\n");

    const prompt = `
    You are a legal AI assistant analyzing legal documents.
    - Generate a concise summary and extract key legal information from these paragraphs
    - Remember the whole API call has lots of paragraphs but you have to treat them as one single document so that you DO NOT create summary about the individual paragraphs or DO NOT lose context
    - do not include any personal opinions or interpretations.
    - we are using citations and backtracking hence return from which para you summarized the text from. this is not strict you can skip the paragraphs who have no relevant information.

    Respond ONLY in valid JSON:

    {
      "summaries": [
        {
          "text": "Summary",
          "sourceParagraphs": ["d1.p1"]
        }
      ],
      "ontologyCandidates": {
        "definitions": [],
        "obligations": [],
        "rights": [],
        "conditions": [],
        "clauses": [],
        "dates": [],
        "parties": []
      }
    }


    Paragraphs:
    ${paragraphText}
  `;

    logPerf("Prompt created", { promptLength: prompt.length });

    const apiTimer = startTimer("OpenAIAPIRequest");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 3500,
    });
    endTimer(apiTimer);

    logPerf("OpenAI response received", {
      usage: response.usage,
      responseLength: response.choices[0]?.message?.content?.length || 0,
      model: "gpt-4o-mini",
    });

    return safeJSON(response.choices[0]?.message?.content || "");
  } catch (error: any) {
    logPerf("OpenAI request failed", { error: error.message });
    throw error;
  } finally {
    endTimer(batchTimer);
  }
}

/**
 * Step 2: Final Aggregator
 * Takes all batch summaries + ontologyCandidates
 * Produces ONE master summary and unified ontology
 */
async function aggregateResults(
  batchResults: any[],
  settings: any
): Promise<SummaryItem> {
  const aggregateTime = startTimer("Aggregation");

  try {
    logPerf("Aggregating batch results", {
      batchCount: batchResults.length,
      totalCharacters: JSON.stringify(batchResults).length,
    });

    const inputJson = JSON.stringify(batchResults, null, 2);

    const prompt = `
    You are a legal AI assistant consolidating multiple partial analyses.
    Your job:
    - Merge all "chunkSummary" fields into a single structured summary.
    - Deduplicate and normalize "ontologyCandidates" across all chunks.
      * If duplicate terms/parties/dates/rights exist, merge them into one.
      * Ensure consistent legal phrasing and formatting.
    - Maintain citations (sourceParagraphs) if provided in the chunks.

    Respond ONLY with valid JSON:

    {
      "title": "7-word unique title",
      "summaries": [
        {
          "text": "Merged summary text",
          "sourceParagraphs": ["d1.p1", "d1.p2", "..."]
        }
      ],
      "legalOntology": {
        "definitions": [],
        "obligations": [],
        "rights": [],
        "conditions": [],
        "clauses": [],
        "dates": [],
        "parties": []
      }
    }

    Batch Results:
    ${inputJson}
  `;

    logPerf("Aggregation prompt created", { promptLength: prompt.length });

    const AggApiTimer = startTimer("OpenAIAggregationAPIRequest");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 5000,
    });
    endTimer(AggApiTimer);

    logPerf("Aggregation API response received", {
      usage: response.usage,
      responseLength: response.choices[0]?.message?.content?.length || 0,
      model: "gpt-4o",
    });

    return parseSummaryItem(response.choices[0]?.message?.content || "");
  } catch (error: any) {
    logPerf("Aggregation failed", { error: error.message });
    throw error;
  } finally {
    endTimer(aggregateTime);
  }
}

/**
 * Helpers
 */
function safeJSON(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid JSON response: " + content.substring(0, 100));
  }
}

function parseSummaryItem(content: string): SummaryItem {
  const parsed = safeJSON(content);

  return {
    title: parsed.title || "",
    summary: parsed.summaries || [],
    legalOntology: parsed.legalOntology || {
      definitions: [],
      obligations: [],
      rights: [],
      conditions: [],
      clauses: [],
      dates: [],
      parties: [],
    },
  };
}
