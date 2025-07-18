import { OpenAI } from "openai";
import pLimit from "p-limit";

// Define the chunk structure
export interface Chunk {
  id: string;
  text: string;
}

// The shape of the extracted data for each chunk
export interface ChunkData {
  summary: string;
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

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Limit concurrency to avoid hitting API rate limits
const limit = pLimit(4);

// Prompt template generator
function createPrompt(chunk: string, sectionTitle?: string): string {
  return `
            You are a legal AI assistant. Analyze the following legal text${
              sectionTitle ? ` from section: "${sectionTitle}"` : ""
            }.

            Tasks:
            1. Provide a concise summary (max 5 lines).
            2. Extract legal entities into these categories:
            - Definitions
            - Obligations
            - Rights
            - Conditions
            - Parties
            - Clauses/Sections
            - Key Dates or Events
            3. Return the results in the following JSON format:

            {
            "summary": "...",
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

            TEXT:
            ${chunk}
`;
}

// Call the OpenAI API for a single chunk and model
async function callModel(chunk: string, model: "gpt-4o" | "gpt-3.5-turbo") {
  const prompt = createPrompt(chunk);
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const output = response.choices[0]?.message?.content;
  if (!output) throw new Error("No response from OpenAI");

  return JSON.parse(output);
}

export async function ChatWithOpenAI(context: string, inputText: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a legal assistant. Use this context to answer questions: ${context}`,
      },
      {
        role: "user",
        content: inputText,
      },
    ],
    temperature: 0.3,
  });

  const output = response.choices[0]?.message?.content;
  if (!output) throw new Error("No response from OpenAI");

  return JSON.parse(output);
}

export async function processChunks(
  chunks: {
    id: string;
    content: string;
    sectionTitle?: string;
    documentName?: string;
  }[]
) {
  const results: {
    chunkId: string;
    modelUsed: string;
    data: any;
  }[] = [];

  const promises = chunks.map((chunk) =>
    limit(async () => {
      try {
        // Try GPT-4o first
        let data;
        try {
          data = await callModel(chunk.content, "gpt-4o");
          return { chunkId: chunk.id, modelUsed: "gpt-4o", data };
        } catch (e) {
          console.warn(`GPT-4o failed for ${chunk.id}, falling back to 3.5`);
          data = await callModel(chunk.content, "gpt-3.5-turbo");
          console.log(`Processed chunk ${chunk.id} with gpt-3.5-turbo`);
          if (!data) throw new Error("No data returned from fallback model");
          // Ensure data is in expected format
          console.log(`this is the data`, data);
          return { chunkId: chunk.id, modelUsed: "gpt-3.5-turbo", data };
        }
      } catch (err) {
        console.error(`Failed to process chunk ${chunk.id}`, err);
        return null;
      }
    })
  );

  const settled = await Promise.allSettled(promises);

  for (const res of settled) {
    if (res.status === "fulfilled" && res.value) {
      results.push(res.value);
    }
  }

  return results;
}
