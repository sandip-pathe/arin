import type { ChatMessages, SummaryItem } from "@/types/page";
import { useSettingsStore } from "@/store/settings-store";

const readError = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    return body.error || fallback;
  } catch {
    return fallback;
  }
};

export async function ChatWithOpenAI(
  context: SummaryItem,
  inputText: string,
  history: ChatMessages[] = []
) {
  const settings = useSettingsStore.getState().settings.summary;
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, inputText, history, settings }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to process chat"));
  }

  const data = (await response.json()) as { output?: string };
  if (!data.output) throw new Error("No response from AI");
  return data.output;
}
