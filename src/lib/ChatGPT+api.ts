import { useAuthStore } from "@/store/auth-store";
import { DocumentChunk, Paragraph } from "@/types/page";
import { OpenAI } from "openai";
import pLimit from "p-limit";

export interface ChunkData {
  summary: {
    text: string;
    sourceParagraphs: string[];
  }[];
  legalOntology: {
    definitions: string[];
    obligations: string[];
    rights: string[];
    conditions: string[];
    clauses: string[];
    dates: string[];
    parties: string[];
  };
}

interface ProcessOptions {
  jurisdiction?: string;
  summaryLength?: string;
  documentType?: string;
  customInstructions?: string;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const limit = pLimit(10);

function createPrompt(
  paragraphs: Paragraph[],
  sectionTitle: string | undefined,
  options: ProcessOptions = {}
): string {
  const settings = useAuthStore.getState().settings.summary;

  const paragraphText = paragraphs
    .map((p) => `(${p.id}) ${p.text}`)
    .join("\n\n");

  let contextInstructions = "Analyze the following legal section";

  return `
    You are a legal AI assistant with expertise in legal document analysis.
    titled "${sectionTitle || "Legal Section"}".
    Your task is to analyze the provided text and extract key legal information.
    Context: ${contextInstructions}
    document type: ${settings.style || "general legal document"}
    Jurisdiction: ${settings.style || "general"}

    Your tasks:

    1. Write a ${settings.length} summary of the important information:
      - DO NOT skip any critical legal information, facts, or clauses.
      - DO NOT include information from irrelevant or non-informative paragraphs.
      - Use proper legal terminology and maintain objectivity.
      - For every summary sentence, cite the paragraph ID(s) it is derived from.

    2. Extract and categorize legal entities:
      - Definitions: Key legal definitions
      - Obligations: Duties or responsibilities
      - Rights: Entitlements or privileges
      - Conditions: Preconditions or requirements
      - Parties: Involved entities or persons
      - Clauses/Sections: Important contractual clauses
      - Dates/Events: Critical timelines or events

    3. ${
      options.customInstructions ||
      "Focus on identifying legally binding elements and potential obligations."
    }

    Respond in valid JSON with this structure:

    {
      "summary": [
        {
          "text": "<summary sentence>",
          "sourceParagraphs": ["c1.p1", "c1.p3"]
        },
        ...
      ],
      "legalOntology": {
        "definitions": [...],
        "obligations": [...],
        "rights": [...],
        "conditions": [...],
        "parties": [...],
        "clauses": [...],
        "dates": [...]
      }
    }

    Now analyze the text below:

    ${paragraphText}
  `;
}

export async function Summarize(
  chunks: DocumentChunk[],
  progressCallback?: (result: any, index: number, total: number) => void,
  options: ProcessOptions = {}
) {
  const results: any[] = [];
  const BATCH_SIZE = 4;
  const modelQueue = [...chunks];

  // Process chunks in batches with progress reporting
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = modelQueue.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map((chunk, idx) =>
      processChunkWithFallback(chunk, options, i + idx)
    );

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach((result, idx) => {
      if (result) {
        results.push(result);
        if (progressCallback) {
          progressCallback(result, i + idx, chunks.length);
        }
      }
    });
  }

  return results;
}

async function processChunkWithFallback(
  chunk: DocumentChunk,
  options: ProcessOptions,
  index: number
) {
  try {
    return await callModel(
      chunk.paragraphs,
      chunk.sectionTitle,
      "gpt-4o-mini",
      options
    );
  } catch (error) {
    console.warn(`Primary model failed, using fallback for chunk ${index}`);
    return callModel(
      chunk.paragraphs,
      chunk.sectionTitle,
      "gpt-4o-mini-2024-07-18",
      options
    );
  }
}

async function callModel(
  paragraphs: Paragraph[],
  sectionTitle: string | undefined,
  model: string,
  options: ProcessOptions
): Promise<ChunkData> {
  const prompt = createPrompt(paragraphs, sectionTitle, options);

  // Stream response for larger chunks
  if (paragraphs.length > 10) {
    return streamModelResponse(prompt, model);
  }

  // Standard request for smaller chunks
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
    max_tokens: 5000,
  });

  return parseModelResponse(
    response?.choices[0]?.message?.content ?? undefined
  );
}

async function streamModelResponse(
  prompt: string,
  model: string
): Promise<ChunkData> {
  const stream = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    stream: true,
    response_format: { type: "json_object" },
  });

  let content = "";
  for await (const chunk of stream) {
    content += chunk.choices[0]?.delta?.content || "";
  }

  return parseModelResponse(content);
}

function parseModelResponse(content?: string): ChunkData {
  if (!content) throw new Error("No response from model");

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid JSON response");
  }
}

export function consolidateResults(
  results: {
    chunkId: string;
    modelUsed: string;
    data: ChunkData;
  }[]
) {
  const consolidated: {
    summary: { text: string; sources: string[] }[];
    ontology: ChunkData["legalOntology"];
  } = {
    summary: [],
    ontology: {
      definitions: [],
      obligations: [],
      rights: [],
      conditions: [],
      clauses: [],
      dates: [],
      parties: [],
    },
  };

  for (const result of results) {
    // Consolidate summaries
    for (const summaryItem of result.data.summary) {
      consolidated.summary.push({
        text: summaryItem.text,
        sources: summaryItem.sourceParagraphs,
      });
    }

    // Consolidate ontology
    for (const category in result.data.legalOntology) {
      const key = category as keyof typeof consolidated.ontology;
      const items = result.data.legalOntology[key];
      if (items && items.length > 0) {
        consolidated.ontology[key] = [
          ...consolidated.ontology[key],
          ...items,
        ] as any;
      }
    }
  }

  // Remove duplicates
  consolidated.ontology.definitions = [
    ...new Set(consolidated.ontology.definitions),
  ];
  consolidated.ontology.obligations = [
    ...new Set(consolidated.ontology.obligations),
  ];
  // Repeat for other categories...

  return consolidated;
}
