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

const getWorkflow = (settings: any) =>
  settings?.workflow === "claim-brief" ? "claim-brief" : "legal";

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
  paragraphs: Paragraph[],
  workflow: "legal" | "claim-brief"
): Promise<any> => {
  const paragraphText = paragraphs
    .map((paragraph) => `(${paragraph.id}) ${paragraph.text}`)
    .join("\n\n");

  const systemPrompt =
    workflow === "claim-brief"
      ? `
You are ClaimBrief, an AI document-review assistant for licensed property insurance claim professionals.
Extract facts from insurance policies, denial letters, carrier estimates, contractor estimates, claim correspondence, and related property-claim documents.

Rules:
1. Output JSON only.
2. Do not hallucinate, negotiate, submit claims, or give legal/public-adjusting advice.
3. Each extraction must be atomic and include sourceParagraphs.
4. Keep every point grounded only in provided text.
5. Flag uncertainty as a question for human review, not as a conclusion.

Schema:
{
  "extractions": [
    { "text": "Claim-relevant point", "sourceParagraphs": ["d1.p1"] }
  ],
  "legalOntology": {
    "parties": ["Insured, insurer, adjuster, contractor, expert, or mortgagee names found"],
    "obligations": ["Notice, proof of loss, mitigation, inspection, documentation, payment, or cooperation duties found"],
    "conditions": ["Coverage conditions, deductibles, exclusions, limitations, endorsements, or triggers found"],
    "clauses": ["Policy provisions, endorsements, exclusions, valuation provisions, suit limitations, or appraisal clauses found"],
    "definitions": ["Defined policy terms or claim terms found"],
    "dates": ["Date of loss, report date, inspection date, denial date, deadline, suit limitation, or follow-up date found"],
    "proceduralPosture": ["Claim stage, denial, underpayment, supplement, appraisal, litigation, or reopen status found"],
    "courtAndJudges": [],
    "conflicts": ["Disputes, estimate mismatches, carrier reasons, missing evidence, or unclear positions found"],
    "implications": ["Questions for human review, evidence gaps, next-document needs, or review priorities found"],
    "citationsAndPrecedents": ["Claim numbers, policy form numbers, statutes, building codes, regulations, or cited authorities found"]
  }
}`
      : `
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
  const workflow = getWorkflow(settings);

  const systemPrompt =
    workflow === "claim-brief"
      ? `
You are ClaimBrief, a careful property insurance claim-document analyst.

Goal: produce one cited claim review brief for a licensed claim professional to review.

Rules:
1. Output JSON only.
2. Do not give legal advice, public adjusting services, claim negotiation, or settlement recommendations.
3. Preserve sourceParagraphs.
4. Separate facts found in the packet from questions for human review.
5. Do not invent policy language, dates, codes, damages, or carrier positions.
6. Style: ${settings?.style || "detailed"}.
7. Tone: ${settings?.tone || "professional"}.
8. Length: ${settings?.length || "medium"}.

Create extraction text entries in this order where evidence exists:
- Claim overview
- Documents reviewed
- Carrier denial or underpayment reasons
- Policy provisions, exclusions, endorsements, and deadlines found
- Estimate or scope mismatches
- Missing evidence checklist
- Draft response outline for human review
- Questions for the licensed reviewer

JSON schema:
{
  "title": "Unique 7-word claim brief title",
  "extractions": [
    { "text": "Claim overview: grounded claim-review point", "sourceParagraphs": ["d1.p1"] }
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
}`
      : `
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
    const workflow = getWorkflow(settings);
    const batches = makeBatches(safeParagraphs);
    const limit = pLimit(CONCURRENCY);
    const batchResults = await Promise.all(
      batches.map((batch) => limit(() => processBatch(openai, batch, workflow)))
    );
    const summary = await aggregateResults(openai, batchResults, settings);

    return NextResponse.json({ summary });
  } catch (error) {
    return jsonError(error, "Failed to summarize document");
  }
}
