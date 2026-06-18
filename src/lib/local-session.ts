import type {
  ChatMessages,
  MinimalSession,
  Paragraph,
  Session,
  SummaryItem,
} from "@/types/page";

const LOCAL_SESSION_PREFIX = "anaya-local-session:";
const LOCAL_SESSION_INDEX_KEY = "anaya-local-sessions";

export type LocalSessionContent = {
  paragraphs?: Paragraph[];
  summaries?: SummaryItem | null;
  quickSummary?: string | null;
  chatMessages?: ChatMessages[];
  title?: string;
  updatedAt?: string;
};

const getStorageKey = (sessionId: string) => `${LOCAL_SESSION_PREFIX}${sessionId}`;

const getTime = (value: MinimalSession["updatedAt"] | undefined): number => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  if (value instanceof Date) return value.getTime();
  if ("toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return Date.now();
};

const normalizeSession = (session: Partial<MinimalSession>): MinimalSession => {
  const now = Date.now();
  const id = session.id || crypto.randomUUID();

  return {
    id,
    title: session.title || "Private Local Session",
    createdAt: getTime(session.createdAt) || now,
    updatedAt: getTime(session.updatedAt) || now,
    userId: session.userId || "local",
    isStarred: Boolean(session.isStarred),
    noOfAttachments: Number(session.noOfAttachments || 0),
    folder: session.folder || "personal",
    sharedWith: session.sharedWith || [],
    owner: session.owner || "This browser",
    summary: session.summary || null,
  };
};

const stripUndefined = <T extends Record<string, unknown>>(value: T): T => {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
};

const reviveChatMessages = (messages?: ChatMessages[]): ChatMessages[] => {
  return (messages ?? []).map((message) => ({
    ...message,
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  }));
};

const readSessionIndex = (): MinimalSession[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_INDEX_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Partial<MinimalSession>[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeSession);
  } catch (error) {
    console.warn("Failed to load local sessions", error);
    return [];
  }
};

const writeSessionIndex = (sessions: MinimalSession[]) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    LOCAL_SESSION_INDEX_KEY,
    JSON.stringify(sessions.map(normalizeSession))
  );
};

export const loadLocalSessionContent = (
  sessionId: string
): LocalSessionContent => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(getStorageKey(sessionId));
    if (!raw) return {};

    const parsed = JSON.parse(raw) as LocalSessionContent;
    return {
      ...parsed,
      chatMessages: reviveChatMessages(parsed.chatMessages),
    };
  } catch (error) {
    console.warn("Failed to load local session content", error);
    return {};
  }
};

export const createLocalSessionMeta = (
  sessionId: string,
  overrides: Partial<MinimalSession> = {}
): MinimalSession =>
  normalizeSession({
    id: sessionId,
    ...overrides,
  });

export const getLocalSessions = (): MinimalSession[] => {
  return readSessionIndex()
    .map((session) => {
      const content = loadLocalSessionContent(session.id);
      return normalizeSession({
        ...session,
        title: content.title || session.title,
        summary: session.summary || content.summaries || null,
        updatedAt: content.updatedAt || session.updatedAt,
      });
    })
    .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
};

export const getLocalSessionMeta = (
  sessionId: string
): MinimalSession | null => {
  const session = readSessionIndex().find((item) => item.id === sessionId);
  if (session) {
    const content = loadLocalSessionContent(sessionId);
    return normalizeSession({
      ...session,
      title: content.title || session.title,
      summary: session.summary || content.summaries || null,
      updatedAt: content.updatedAt || session.updatedAt,
    });
  }

  const content = loadLocalSessionContent(sessionId);
  if (
    content.title ||
    content.paragraphs?.length ||
    content.summaries ||
    content.quickSummary ||
    content.chatMessages?.length
  ) {
    const rebuilt = createLocalSessionMeta(sessionId, {
      title: content.title || "Private Local Session",
      summary: content.summaries || null,
      updatedAt: content.updatedAt || Date.now(),
    });
    upsertLocalSessionMeta(rebuilt);
    return rebuilt;
  }

  return null;
};

export const upsertLocalSessionMeta = (session: MinimalSession) => {
  if (typeof window === "undefined") return;

  const normalized = normalizeSession(session);
  const sessions = readSessionIndex();
  const existingIndex = sessions.findIndex((item) => item.id === normalized.id);

  if (existingIndex >= 0) {
    sessions[existingIndex] = normalizeSession({
      ...sessions[existingIndex],
      ...normalized,
      createdAt: sessions[existingIndex].createdAt || normalized.createdAt,
    });
  } else {
    sessions.unshift(normalized);
  }

  writeSessionIndex(sessions);
};

export const updateLocalSessionMeta = (
  sessionId: string,
  patch: Partial<MinimalSession>
) => {
  const existing = getLocalSessionMeta(sessionId);
  const cleanPatch = stripUndefined(patch as Record<string, unknown>);
  upsertLocalSessionMeta(
    normalizeSession({
      ...(existing || createLocalSessionMeta(sessionId)),
      ...cleanPatch,
      id: sessionId,
      updatedAt: patch.updatedAt || Date.now(),
    })
  );
};

export const ensureLocalSessionMeta = (
  sessionId: string,
  patch: Partial<MinimalSession> = {}
): MinimalSession => {
  const existing = getLocalSessionMeta(sessionId);
  if (existing) {
    const next = normalizeSession({
      ...existing,
      ...patch,
      id: sessionId,
      updatedAt: patch.updatedAt || existing.updatedAt,
    });
    upsertLocalSessionMeta(next);
    return next;
  }

  const created = createLocalSessionMeta(sessionId, patch);
  upsertLocalSessionMeta(created);
  return created;
};

export const deleteLocalSession = (sessionId: string) => {
  if (typeof window === "undefined") return;

  const sessions = readSessionIndex().filter((item) => item.id !== sessionId);
  writeSessionIndex(sessions);
  window.localStorage.removeItem(getStorageKey(sessionId));
};

export const localMetaToSession = (session: MinimalSession): Session => ({
  id: session.id,
  userId: session.userId,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
  createdBy: session.owner,
  owner: session.owner,
  sharedWith: session.sharedWith,
  isStarred: session.isStarred,
  folder: session.folder,
  noOfAttachments: session.noOfAttachments,
  title: session.title,
  summaries: session.summary || null,
});

export const saveLocalSessionContent = (
  sessionId: string,
  patch: LocalSessionContent
) => {
  if (typeof window === "undefined") return;

  try {
    const existing = loadLocalSessionContent(sessionId);
    const next: LocalSessionContent = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(getStorageKey(sessionId), JSON.stringify(next));
    updateLocalSessionMeta(sessionId, {
      title: patch.title || existing.title,
      summary: patch.summaries || existing.summaries || null,
      updatedAt: next.updatedAt,
    });
  } catch (error) {
    console.warn("Failed to save local session content", error);
    throw error;
  }
};

export const appendLocalChatMessage = (
  sessionId: string,
  message: ChatMessages
) => {
  const existing = loadLocalSessionContent(sessionId);
  saveLocalSessionContent(sessionId, {
    chatMessages: [...reviveChatMessages(existing.chatMessages), message],
  });
};

export const clearLocalChatMessages = (sessionId: string) => {
  saveLocalSessionContent(sessionId, { chatMessages: [] });
};
