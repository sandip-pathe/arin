import { OpenAI } from "openai";
import { Paragraph, SummaryItem } from "@/types/page";
import { useAuthStore } from "@/store/auth-store";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function summarizeParagraphs(
  paragraphs: Paragraph[],
  progressCallback?: (percent: number) => void
): Promise<SummaryItem[]> {
  const settings = useAuthStore.getState().settings.summary;
  const BATCH_SIZE = 100; // 100 para * 200 words * 1.33 tokens = 26k + returned max_tokens (4k) == 30K
  const batchResults: SummaryItem[] = [];

  for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
    const batch = paragraphs.slice(i, i + BATCH_SIZE);
    const result = await processBatch(batch, settings);
    batchResults.push(result);

    if (progressCallback) {
      progressCallback(
        Math.min(100, Math.round((i / paragraphs.length) * 100))
      );
    }
  }

  return batchResults;
}

async function processBatch(
  paragraphs: Paragraph[],
  settings: any
): Promise<SummaryItem> {
  const prompt = createPrompt(paragraphs, settings);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
    max_tokens: 4000,
  });

  return parseResponse(response.choices[0]?.message?.content || "");
}

function createPrompt(paragraphs: Paragraph[], settings: any): string {
  const paragraphText = paragraphs
    .map((p) => `(${p.id}) ${p.text}`)
    .join("\n\n");

  return `
    You are a legal AI assistant analyzing legal documents. 
    Generate a concise summary and extract key legal information from these paragraphs:
    Remember the whole API call has lots of paragraphs but you have to treat them as one single document so that you DO NOT create summary about the individual paragraphs or DO NOT lose context

    do not include any personal opinions or interpretations.

    Tasks:
    0. create a title around 7 words, make it unique || specific
    1. Write ${settings.length} summaries
    2. Extract and categorize legal entities


    Respond with valid JSON:

    {
      "title": "title",
      "summaries": [
        {
          "text": "Summary",
          "sourceParagraphs": ["d1.p1"]
        }
      ],
      "legalOntology": {
        "definitions": [],
        "obligations": [],
        "rights": [],
        "conditions": [],
        "clauses": [],
        "dates": [], // also mention what date is for like "contract start date: dd-mm-yyyy"
        "parties": [] 
      }
    }

    Paragraphs:
    ${paragraphText}
  `;
}

function parseResponse(content: string): SummaryItem {
  try {
    const parsed = JSON.parse(content);

    return {
      title: parsed.title || "",
      summary: parsed.summaries || parsed.summary || [],
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
  } catch (error) {
    // Fallback parsing
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || "",
          summary: parsed.summaries || parsed.summary || [],
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
      } catch {
        throw new Error("Invalid JSON response");
      }
    }
    throw new Error("Invalid JSON response: " + content.substring(0, 100));
  }
}
