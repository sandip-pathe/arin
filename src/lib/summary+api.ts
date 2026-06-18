import { useSettingsStore } from "@/store/settings-store";
import type { Paragraph, SummaryItem } from "@/types/page";

const readError = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    return body.error || fallback;
  } catch {
    return fallback;
  }
};

export async function summarizeParagraphs(
  paragraphs: Paragraph[],
  progressCallback?: (percent: number, phase?: string, partial?: any) => void
): Promise<SummaryItem> {
  progressCallback?.(5, "Preparing secure summary request...");

  const settings = useSettingsStore.getState().settings.summary;
  const response = await fetch("/api/ai/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paragraphs, settings }),
  });

  if (!response.ok) {
    throw new Error(
      await readError(response, "Failed to summarize the document")
    );
  }

  progressCallback?.(95, "Finalizing summary...");
  const data = (await response.json()) as { summary: SummaryItem };
  progressCallback?.(100, "Complete");
  return data.summary;
}

export async function quickSkimSummary(paragraphs: Paragraph[]): Promise<string> {
  const response = await fetch("/api/ai/quick-skim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paragraphs }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to create quick skim"));
  }

  const data = (await response.json()) as { summary: string };
  return data.summary;
}
