import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import {
  ApiConfigError,
  jsonError,
  normalizeParagraphs,
  parseJsonBody,
} from "@/lib/ai-route-utils";

export const runtime = "nodejs";

const getWorkflow = (settings: any) =>
  settings?.workflow === "claim-brief" ? "claim-brief" : "legal";

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiConfigError(
      "AI service is not configured. Add OPENAI_API_KEY to the local environment."
    );
  }
  return new OpenAI({ apiKey });
};

export async function POST(request: Request) {
  try {
    const { paragraphs, settings } = await parseJsonBody<{
      paragraphs: unknown;
      settings?: unknown;
    }>(request);
    const safeParagraphs = normalizeParagraphs(paragraphs);
    const workflow = getWorkflow(settings);

    const inputText = safeParagraphs
      .map((paragraph) => paragraph.text)
      .join("\n\n");
    const systemPrompt =
      workflow === "claim-brief"
        ? `
You are ClaimBrief, an AI document-review assistant for licensed property insurance claim professionals.
Write one concise briefing paragraph about the claim packet.
Focus on claim type, carrier position, policy/estimate issues, missing evidence, and review priorities.
Do not give legal advice, public adjusting services, negotiation instructions, or settlement recommendations.
Do not invent facts not present in the text.`
        : `
You are a legal AI assistant.
Write one concise plain-English briefing paragraph.
Focus on core facts, issues, obligations, and outcomes.
Do not give legal advice. Do not invent anything not present in the text.`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: inputText },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    return NextResponse.json({
      summary: response.choices[0]?.message?.content?.trim() || "",
    });
  } catch (error) {
    return jsonError(error, "Failed to create quick skim");
  }
}
