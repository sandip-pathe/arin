import { OpenAI } from "openai";
import { Paragraph, SummaryItem } from "@/types/page";
import { useAuthStore } from "@/store/auth-store";
import { endTimer, logPerf, startTimer } from "./hi";
import pLimit from "p-limit";
import { makeAdaptiveBatches } from "./chunk";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const CONCURRENCY = 4;
const limit = pLimit(CONCURRENCY);

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
    const batches = makeAdaptiveBatches(paragraphs, 10000);

    const batchResult = await Promise.all(
      batches.map((batch, idx) =>
        limit(async () => {
          const result = await processBatch(batch, settings);

          if (progressCallback) {
            progressCallback(
              Math.min(100, Math.round(((idx + 1) / batches.length) * 100))
            );
          }

          return result;
        })
      )
    );

    logPerf("All batches completed Results", batchResult);
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
    logPerf("Batch Processing", { paragraphCount: paragraphs.length });

    const paragraphText = paragraphs
      .map((p) => `(${p.id}) ${p.text}`)
      .join("\n\n");

    const PROCESS_BATCH_SYSTEM_PROMPT = `
      You are a specialized legal AI assistant. 
      Read the input carefully and extract the legally significant points.Your job is to capture the **essence**.
      
      Do not hallucinate or invent. 
      You may **lightly rephrase for clarity** (e.g. remove repetition, join fragmented sentences, simplify), but never distort meaning. 
      Think like a junior associate briefing a senior partner: accurate, concise, legally faithful.

      STRICT RULES:
        1. EXTRACTIONS: 
          - Output multiple entries under "extractions". 
          - Each entry = one atomic legal point (principle, ruling, fact). 
          - Must include "sourceParagraphs".
          - Group related sentences into one clearer point when appropriate.
        2. ONTOLOGY MAPPING: 
          - Return the ontology if relevant data is identified in the input.
        3. NO INVENTION: Only fill ontology with content present in the text.
        4. STYLE: Use clear, professional legal writing — accurate but reader-friendly.

        SCHEMA (JSON only):
        {
          "extractions": [
            {
              "text": "text 1",
              "sourceParagraphs": ["dX.pY", "dX.pY"]
            },
            {
              "text": "text 2",
              "sourceParagraphs": ["dX.pY"]
            }
          ],
          "legalOntology": {
            "parties": [
              {
                "role": "Plaintiff",
                "name": "ABC Ltd.",
                "implication": "Filed a civil suit for damages"
              }
            ],
            "obligations": [
                "Defendant must pay damages"
            ],
            "conditions": [
              {
                "trigger": "Non-payment within 30 days",
                "consequence": "Accrued interest at 6% p.a.",
                "src":["dX.pY"]
              }
            ],
            "clauses": [
              {
                "text": "All disputes shall be referred to arbitration in Mumbai",
                "src": ["dX.pY"]
              }
            ],
            "definitions": [
              {
                "term": "Effective Date",
                "defination": "The date on which this Agreement is signed",
                "src": ["dX.pY"]
              }
            ],
            "dates": [
              {
                "type": "Filing Date",
                "value": "dd/mm/yyyy"
              }
            ],
            "proceduralPosture": [
              {
                "stage": "Appeal"
              }
            ],
            "courtAndJudges": [
              {
                "court": "Supreme Court of India",
                "judge": "Justice DY Chandrachud",
                "benchSize": 3
              }
            ],
            "conflicts": [
              {
                "issue": "Payment amount differs across extractions",
                "versions": [
                  { "value": "₹50,00,000", "source": ["dX.pY"] },
                  { "value": "₹45,00,000", "source": ["dX.pY"] }
                ]
              }
            ],
            "implications": [
                {
                  "text": "If Defendant fails to pay damages, Plaintiff may initiate contempt proceedings",
                  "src": ["dX.pY"]
                }
            ],
            "citationsAndPrecedents": [
              {
                "caseName": "Avitel Post Studioz v. HSBC PI Holdings",
                "citation": "(2020) 4 SCC 1",
                "relevance": "Relied on for arbitration enforceability"
              }
            ]
          }
        }`;

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
      max_tokens: 8000,
    });
    endTimer(apiTimer);

    logPerf("OpenAI response received Batch Process", {
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
      You are acting as a **senior legal associate** reviewing multiple extraction results from different batches.  

      GOAL: Produce **one master structured summary** + **unified ontology**.

      RULES:
      1. EXTRACT + MERGE:
        - Include all extractions from all batches.
        - If two are identical in meaning, merge and union their "sourceParagraphs".
        - If they differ in meaning, keep both.

      2. ONTOLOGY CONSOLIDATION:
        - Deduplicate entities (e.g. same party or clause).
        - Keep conflicts explicitly if values differ (e.g. payment amounts).
        - Maintain structured categories (parties, clauses, obligations, etc.).

      3. USER SETTINGS:
        - Length: ${settings.length} (short / medium / long).
        - Tone: ${settings.tone} (formal / professional / casual).
        - Jurisdiction: ${settings.jurisdiction}.
        - Style: ${settings.style} (detailed / concise / narrative).

      4. STYLE:
        - Professional, accurate, legally faithful.
        - Prefer clarity over verbosity.
        - No hallucination, no omissions.

      FINAL OUTPUT SCHEMA (JSON only):
      {
        "title": "Unique 7-word descriptive title",
        "extractions": [
          {
            "text": "The Defendant failed to pay damages despite demand.",
            "sourceParagraphs": ["d3.p5", "d3.p6"]
          }
        ],
        "legalOntology": {
          "parties": [...],
          "obligations": [...],
          "conditions": [...],
          "clauses": [...],
          "definitions": [...],
          "dates": [...],
          "proceduralPosture": [...],
          "courtAndJudges": [...],
          "conflicts": [...],
          "implications": [...],
          "citationsAndPrecedents": [...]
        }
      }`;

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
      max_tokens: 8000,
    });
    endTimer(AggApiTimer);

    logPerf("OpenAI aggregation response received", {
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
    summary: parsed.extractions || [],
    legalOntology: parsed.legalOntology || {
      definitions: [],
      obligations: [],
      rights: [],
      conditions: [],
      clauses: [],
      dates: [],
      parties: [],
      proceduralPosture: [],
      courtAndJudges: [],
      conflicts: [],
      implications: [],
      citationsAndPrecedents: [],
    },
  };
}

export async function quickSkimSummary(text: Paragraph[]): Promise<string> {
  const timer = startTimer("QuickSkim");
  const inputText = text.map((p) => p.text).join("\n\n");
  logPerf("Starting quick skim", { inputLength: text.length });

  const QUICK_SKIM_SYSTEM_PROMPT = `
    You are a legal AI assistant. 
    Task: produce a **concise plain-English briefing note** from the input text.

    RULES:
    - Output a single flowing paragraph (~8–10 sentences).
    - Focus on the **core facts, issues, obligations, and outcomes**.
    - No schema, no bullet points, no citations.
    - Style: professional but easy to read, as if preparing a quick summary for a busy senior lawyer.
    - Avoid over-interpretation. Stick strictly to text.
    - Use Paul Graham's writing style.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: QUICK_SKIM_SYSTEM_PROMPT },
        { role: "user", content: `\n\n${inputText}` },
      ],
      temperature: 0.2,
      max_tokens: 500,
      stream: false,
    });

    const summary = response.choices[0]?.message?.content?.trim() || "";
    logPerf("Quick skim completed", { summaryLength: summary.length });
    return summary;
  } catch (err: any) {
    logPerf("Quick skim error", { error: err.message });
    throw err;
  } finally {
    endTimer(timer);
  }
}
