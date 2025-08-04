import { useAuthStore } from "@/store/auth-store";
import { OpenAI } from "openai";
import pLimit from "p-limit";

export interface Paragraph {
  id: string;
  text: string;
}

export interface Chunk {
  id: string;
  paragraphs: Paragraph[];
  sectionTitle?: string;
  tokenEstimate: number;
}

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
  jurisdiction?: "IND" | "UK" | "US" | "EU" | "AU" | "CA" | "Other";
  summaryLength?: "concise" | "detailed" | "comprehensive";
  documentType?: "contract" | "statute" | "regulation" | "case-law" | "other";
  customInstructions?: string;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const limit = pLimit(6);

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

async function callModel(
  paragraphs: Paragraph[],
  sectionTitle: string | undefined,
  model: "gpt-4o-mini-2024-07-18" | "gpt-3.5-turbo",
  options: ProcessOptions
): Promise<ChunkData> {
  const prompt = createPrompt(paragraphs, sectionTitle, options);

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2, // Lower temperature for more deterministic legal analysis
    response_format: { type: "json_object" },
    max_tokens: 4000, // Increased for comprehensive responses
  });

  const output = response.choices[0]?.message?.content;
  if (!output) throw new Error("No response from OpenAI");

  try {
    return JSON.parse(output);
  } catch (e) {
    console.error("JSON parsing failed, attempting to fix", output);
    // Attempt to extract JSON from malformed response
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response from OpenAI");
  }
}

export async function processChunks(
  chunks: Chunk[],
  options: ProcessOptions = {}
) {
  const results: {
    chunkId: string;
    modelUsed: string;
    data: ChunkData;
  }[] = [];

  // Pre-calculate fallback strategy
  const useFallbackModel = chunks.length > 10;
  const primaryModel = "gpt-4o-mini-2024-07-18";
  const fallbackModel = "gpt-3.5-turbo";

  const processChunk = async (chunk: Chunk) => {
    try {
      // Try primary model first
      try {
        const data = await callModel(
          chunk.paragraphs,
          chunk.sectionTitle,
          primaryModel,
          options
        );
        return {
          chunkId: chunk.id,
          modelUsed: primaryModel,
          data,
        };
      } catch (e) {
        if (!useFallbackModel) throw e;

        console.warn(
          `${primaryModel} failed for ${chunk.id}, falling back to ${fallbackModel}`
        );
        const data = await callModel(
          chunk.paragraphs,
          chunk.sectionTitle,
          fallbackModel,
          options
        );
        return {
          chunkId: chunk.id,
          modelUsed: fallbackModel,
          data,
        };
      }
    } catch (err) {
      console.error(`Failed to process chunk ${chunk.id}`, err);
      return null;
    }
  };

  // Process chunks in parallel with progress tracking
  const chunkPromises = chunks.map((chunk) => limit(() => processChunk(chunk)));

  // Process in batches for better progress tracking
  const batchSize = 4;
  for (let i = 0; i < chunkPromises.length; i += batchSize) {
    const batch = chunkPromises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);

    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }

    console.log(
      `Processed ${Math.min(i + batchSize, chunks.length)}/${
        chunks.length
      } chunks`
    );
  }

  return results;
}

// Utility function to consolidate results
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
