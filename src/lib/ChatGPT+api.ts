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

    const PROCESS_BATCH_SYSTEM_PROMPT = `
      You are a specialized legal AI assistant. Your role is to extract legal information with absolute precision. 
      Do not provide legal advice, commentary, or interpretation. Only summarize what is explicitly in the text. 

      STRICT PRINCIPLES:
        1. EXTRACT-ONLY: Do not invent or infer clauses. If uncertain, include the ambiguity as-is.
        2. TRACEABILITY: Every item must include sourceParagraph IDs.
        3. COMPLETENESS: Capture all legally relevant details — obligations, rights, definitions, conditions, clauses, dates, parties. 
        4. SKIP: If a paragraph has no substantive legal content, skip it.
        5. CONSISTENCY: Use legal terminology faithfully; preserve ambiguity and contradictions.

      SCHEMA (respond ONLY in JSON):
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
      `;

    logPerf("Prompt created", {
      promptLength: PROCESS_BATCH_SYSTEM_PROMPT.length,
    });

    const apiTimer = startTimer("OpenAIAPIRequest");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PROCESS_BATCH_SYSTEM_PROMPT },
        {
          role: "user",
          content: `\n\n${paragraphText}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4000,
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

    const AGGREGATE_SYSTEM_PROMPT = `
      You are a senior legal analyst consolidating multiple batch analyses into a master structured summary.
      Do not provide legal advice. Summarize faithfully without inventing content. 

      CORE RESPONSIBILITIES:
        1. MERGE comprehensively: include all items across batches; do not drop information.
        2. DEDUPLICATE carefully: merge only if identical in meaning. If parties, dates, or conditions differ, keep separate.
        3. TRACEABILITY: Preserve all sourceParagraph citations.
        4. CRITICAL CLAUSES: Verify presence/absence of indemnity, liability, termination, payment, confidentiality, governing law, dispute resolution. If not found, output "not found".
        5. CONFLICTS: If contradictory clauses exist, output them separately in a "conflicts" section.
        6. COMPLETENESS CHECK: Ensure all ontology items from Stage 1 appear in the final ontology.
        7. PLAIN ENGLISH LAYER: Add accessible explanations, but keep legal fidelity.
        8. NEUTRALITY: Do not give advice or opinions.


      USER SETTINGS:
        - Length: ${settings.length} // short, medium, long
        - Tone: ${settings.tone} // formal, professional, casual
        - Jurisdiction: ${settings.jurisdiction} // e.g. "United States"
        - Style: ${settings.style} // detailed, concise, narrative

      FINAL OUTPUT SCHEMA (JSON only):
      {
        "title": "7-word unique title",
        "summaries": [
          {
            "text": "induplicated summary text",
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
      `;

    logPerf("Aggregation prompt created", { promptLength: prompt.length });

    const AggApiTimer = startTimer("OpenAIAggregationAPIRequest");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: AGGREGATE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `\n\n${inputJson}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });
    endTimer(AggApiTimer);

    logPerf("Aggregation API response received", {
      usage: response.usage,
      responseLength: response.choices[0]?.message?.content?.length || 0,
      model: "gpt-4o-mini",
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
