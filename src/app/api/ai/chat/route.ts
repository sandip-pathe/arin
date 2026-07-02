import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import {
  ApiConfigError,
  jsonError,
  normalizeChatHistory,
  normalizeChatInput,
  normalizeSummaryContext,
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
    const {
      context,
      inputText,
      history = [],
      settings,
    }: {
      context: unknown;
      inputText: unknown;
      history?: unknown;
      settings?: unknown;
    } = await parseJsonBody(request);

    const safeContext = normalizeSummaryContext(context);
    const safeInputText = normalizeChatInput(inputText);
    const workflow = getWorkflow(settings);
    const formattedHistory = normalizeChatHistory(history).map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));
    const systemPrompt =
      workflow === "claim-brief"
        ? `
You are ClaimBrief, a precise property insurance claim-document assistant.
Stay grounded in the provided claim brief context.
Do not invent facts, policy language, deadlines, coverage, damages, or carrier positions.
Do not give legal advice, public adjusting services, claim negotiation, or settlement recommendations.
You may clarify what the documents say, list evidence gaps, draft neutral review questions, and explain where information appears in the context.
Keep answers structured, clear, concise, and plain text only.

Reference context:
${JSON.stringify(safeContext, null, 2)}`
        : `
You are ANAYA, a precise and reliable AI legal assistant.
Stay grounded in the provided context.
Do not make up information not present in the context.
If asked for advice, say you cannot provide legal advice, but can clarify the document.
Keep answers structured, clear, concise, and plain text only.

Reference context:
${JSON.stringify(safeContext, null, 2)}`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...formattedHistory,
        { role: "user", content: safeInputText },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const output = response.choices[0]?.message?.content;
    if (!output) throw new Error("No response from OpenAI");

    return NextResponse.json({ output });
  } catch (error) {
    return jsonError(error, "Failed to process chat");
  }
}
