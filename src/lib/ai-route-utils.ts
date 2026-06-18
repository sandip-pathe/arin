import { NextResponse } from "next/server";
import type { ChatMessages, Paragraph, SummaryItem } from "@/types/page";

const MAX_PARAGRAPHS = 1200;
const MAX_PARAGRAPH_CHARACTERS = 120000;
const MAX_CHAT_INPUT_CHARACTERS = 4000;
const MAX_CHAT_HISTORY_MESSAGES = 20;
const MAX_CHAT_HISTORY_CHARACTERS = 24000;
const MAX_CONTEXT_CHARACTERS = 80000;

class SafeApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export class ApiInputError extends SafeApiError {
  constructor(message: string, status = 400) {
    super(message, status);
  }
}

export class ApiConfigError extends SafeApiError {
  constructor(message: string) {
    super(message, 503);
  }
}

export const parseJsonBody = async <T>(request: Request): Promise<T> => {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiInputError("Expected an application/json request.", 415);
  }

  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiInputError("Request body must be valid JSON.");
  }
};

export const normalizeParagraphs = (value: unknown): Paragraph[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiInputError("At least one paragraph is required.");
  }

  if (value.length > MAX_PARAGRAPHS) {
    throw new ApiInputError(
      `Too many paragraphs. The limit is ${MAX_PARAGRAPHS}.`,
      413
    );
  }

  let totalCharacters = 0;
  const paragraphs = value.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new ApiInputError("Each paragraph must be an object.");
    }

    const source = entry as Partial<Paragraph>;
    const text = typeof source.text === "string" ? source.text.trim() : "";
    if (!text) {
      throw new ApiInputError("Each paragraph must include text.");
    }

    totalCharacters += text.length;
    if (totalCharacters > MAX_PARAGRAPH_CHARACTERS) {
      throw new ApiInputError(
        `Document text is too large. The limit is ${MAX_PARAGRAPH_CHARACTERS} characters.`,
        413
      );
    }

    return {
      ...source,
      id: typeof source.id === "string" ? source.id : `p${index + 1}`,
      text,
    } as Paragraph;
  });

  return paragraphs;
};

export const normalizeChatInput = (value: unknown): string => {
  const input = typeof value === "string" ? value.trim() : "";
  if (!input) {
    throw new ApiInputError("A chat message is required.");
  }

  if (input.length > MAX_CHAT_INPUT_CHARACTERS) {
    throw new ApiInputError(
      `Chat message is too long. The limit is ${MAX_CHAT_INPUT_CHARACTERS} characters.`,
      413
    );
  }

  return input;
};

export const normalizeChatHistory = (
  value: unknown
): Pick<ChatMessages, "role" | "content">[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiInputError("Chat history must be an array.");
  }

  let totalCharacters = 0;
  return value.slice(-MAX_CHAT_HISTORY_MESSAGES).map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new ApiInputError("Each chat history item must be an object.");
    }

    const message = entry as Partial<ChatMessages>;
    if (message.role !== "user" && message.role !== "assistant") {
      throw new ApiInputError("Chat history contains an invalid role.");
    }

    const content =
      typeof message.content === "string" ? message.content.trim() : "";
    if (!content) {
      throw new ApiInputError("Chat history contains an empty message.");
    }

    totalCharacters += content.length;
    if (totalCharacters > MAX_CHAT_HISTORY_CHARACTERS) {
      throw new ApiInputError(
        `Chat history is too large. The limit is ${MAX_CHAT_HISTORY_CHARACTERS} characters.`,
        413
      );
    }

    return { role: message.role, content };
  });
};

export const normalizeSummaryContext = (value: unknown): SummaryItem => {
  if (!value || typeof value !== "object") {
    throw new ApiInputError("Summary context is required.");
  }

  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_CONTEXT_CHARACTERS) {
    throw new ApiInputError(
      `Summary context is too large. The limit is ${MAX_CONTEXT_CHARACTERS} characters.`,
      413
    );
  }

  return value as SummaryItem;
};

export const jsonError = (error: unknown, fallback: string) => {
  if (error instanceof SafeApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
};
