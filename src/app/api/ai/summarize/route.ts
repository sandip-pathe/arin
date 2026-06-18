import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import pLimit from "p-limit";
import type { Paragraph, SummaryItem } from "@/types/page";
import {
  ApiConfigError,
  jsonError,
  normalizeParagraphs,
  parseJsonBody,
} from "@/lib/ai-route-utils";

export const runtime = "nodejs";

const CONCURRENCY = 4;
const MAX_TOKENS_PER_BATCH = 10000;

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiConfigError(
      "AI service is not configured. Add OPENAI_API_KEY to the local environment."
    );
  }
  return new OpenAI({ apiKey });
};

const makeBatches = (
  paragraphs: Paragraph[],
  maxTokens = MAX_TOKENS_PER_BATCH
): Paragraph[][] => {
  const batches: Paragraph[][] = [];
  let current: Paragraph[] = [];
  let tokenCount = 0;

  for (const paragraph of paragraphs) {
    const estimatedTokens = Math.ceil(paragraph.text.length / 4);
    if (tokenCount + estimatedTokens > maxTokens && current.length > 0) {
      batches.push(current);
      current = [];
      tokenCount = 0;
    }

    current.push(paragraph);
    tokenCount += estimatedTokens;
  }

  if (current.length > 0) batches.push(current);
  return batches;
};

const safeJSON = (content: string): any => {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error(`Invalid JSON response: ${content.substring(0, 100)}`);
  }
};

const defaultOntology = () => ({
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
});

const parseSummaryItem = (content: string): SummaryItem => {
  const parsed = safeJSON(content);

  return {
    title: parsed.title || "",
    summary: parsed.extractions || parsed.summary || parsed.summaries || [],
    legalOntology: parsed.legalOntology || defaultOntology(),
  };
};

const processBatch = async (
  openai: OpenAI,
  paragraphs: Paragraph[]
): Promise<any> => {
  const paragraphText = paragraphs
    .map((paragraph) => `(${paragraph.id}) ${paragraph.text}`)
    .join("\n\n");

  const systemPrompt = `
You are a specialized legal AI assistant.
Extract legally significant points from the provided text.

Rules:
1. Output JSON only.
2. Do not hallucinate or invent facts.
3. Each extraction must be atomic and include sourceParagraphs.
4. Keep legal ontology fields grounded only in provided text.

Schema:
{
  "extractions": [
    { "text": "Atomic legal point", "sourceParagraphs": ["d1.p1"] }
  ],
  "legalOntology": {
    "parties": [],
    "obligations": [],
    "conditions": [],
    "clauses": [],
    "definitions": [],
    "dates": [],
    "proceduralPosture": [],
    "courtAndJudges": [],
    "conflicts": [],
    "implications": [],
    "citationsAndPrecedents": []
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: paragraphText },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
    max_tokens: 8000,
  });

  return safeJSON(response.choices[0]?.message?.content || "");
};

const aggregateResults = async (
  openai: OpenAI,
  batchResults: any[],
  settings: any
): Promise<SummaryItem> => {
  const inputJson = JSON.stringify(batchResults, null, 2);

  const systemPrompt = `
You are a senior legal associate consolidating extraction results.

Goal: produce one master structured summary and unified ontology.

Rules:
1. Include all material legal points.
2. Merge only genuinely duplicate extractions.
3. Preserve sourceParagraphs.
4. Keep conflicts explicit.
5. Style: ${settings?.style || "detailed"}.
6. Tone: ${settings?.tone || "professional"}.
7. Length: ${settings?.length || "medium"}.
8. Jurisdiction context: ${settings?.jurisdiction || "unspecified"}.

JSON schema:
{
  "title": "Unique 7-word descriptive title",
  "extractions": [
    { "text": "Legal point", "sourceParagraphs": ["d1.p1"] }
  ],
  "legalOntology": {
    "parties": [],
    "obligations": [],
    "conditions": [],
    "clauses": [],
    "definitions": [],
    "dates": [],
    "proceduralPosture": [],
    "courtAndJudges": [],
    "conflicts": [],
    "implications": [],
    "citationsAndPrecedents": []
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputJson },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
    max_tokens: 8000,
  });

  return parseSummaryItem(response.choices[0]?.message?.content || "");
};

export async function POST(request: Request) {
  try {
    const { paragraphs, settings } = await parseJsonBody<{
      paragraphs: unknown;
      settings?: unknown;
    }>(request);

    const openai = getOpenAI();
    const safeParagraphs = normalizeParagraphs(paragraphs);
    const batches = makeBatches(safeParagraphs);
    const limit = pLimit(CONCURRENCY);
    const batchResults = await Promise.all(
      batches.map((batch) => limit(() => processBatch(openai, batch)))
    );
    const summary = await aggregateResults(openai, batchResults, settings);

    return NextResponse.json({ summary });
  } catch (error) {
    return jsonError(error, "Failed to summarize document");
  }
}
