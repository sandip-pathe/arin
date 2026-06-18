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
    }: {
      context: unknown;
      inputText: unknown;
      history?: unknown;
    } = await parseJsonBody(request);

    const safeContext = normalizeSummaryContext(context);
    const safeInputText = normalizeChatInput(inputText);
    const formattedHistory = normalizeChatHistory(history).map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are ANAYA, a precise and reliable AI legal assistant.
Stay grounded in the provided context.
Do not make up information not present in the context.
If asked for advice, say you cannot provide legal advice, but can clarify the document.
Keep answers structured, clear, concise, and plain text only.

Reference context:
${JSON.stringify(safeContext, null, 2)}`,
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
