import { OpenAI } from "openai";
import { ChatMessages, SummaryItem } from "@/types/page";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function ChatWithOpenAI(
  context: SummaryItem,
  inputText: string,
  history: ChatMessages[] = []
) {
  // Convert history to OpenAI message format
  const formattedHistory = history.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  const inputJson = JSON.stringify(context, null, 2);

  const CONVERSATION_PROMPT = `
        You are ANAYA, a precise and reliable AI legal assistant.
        - You always stay grounded in the provided context.
        - Never make up information not present in the context.
        - If the user asks for opinions, explain that you cannot provide legal advice but can clarify the document in plain English, define terms, or summarize risks.
        - Keep answers structured, clear, and concise.
        - In general you can talk about laws, and legal concepts. If user is asking outside and you are not sure, mention that you are only limited to legal information.
        - When needed, refer back to the context using simple references like "In the section on indemnity..." rather than hallucinating citations.
        - No highlights, only plain text
        - Keep the response short mostly

        REFERENCE CONTEXT; summaries and ontology
        ${inputJson}
        `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: CONVERSATION_PROMPT,
      },
      ...formattedHistory,
      {
        role: "user",
        content: inputText,
      },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  });

  const output = response.choices[0]?.message?.content;
  if (!output) throw new Error("No response from OpenAI");

  return output;
}
