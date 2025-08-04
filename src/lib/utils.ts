import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OpenAI } from "openai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

  return output;
}
