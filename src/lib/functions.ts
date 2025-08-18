import { ChatMessages, DocumentChunk, Paragraph } from "@/types/page";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export const saveParagraphsToFirestore = async (
  sessionId: string,
  paragraphs: Paragraph[]
) => {
  const paragraphCollection = collection(
    db,
    "sessions",
    sessionId,
    "paragraphs"
  );
  const batch = writeBatch(db);

  paragraphs.forEach((para, index) => {
    const paraId = `p${index + 1}`;
    const paragraphRef = doc(paragraphCollection, paraId);

    batch.set(paragraphRef, {
      id: paraId,
      text: para.text,
      sectionTitle: para.sectionTitle || `Section ${index + 1}`,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

export const loadParagraphs = async (
  sessionId: string
): Promise<Paragraph[]> => {
  const paragraphsRef = collection(db, "sessions", sessionId, "paragraphs");
  const snapshot = await getDocs(paragraphsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      text: data.text,
      sectionTitle: data.sectionTitle || "Main Document",
    } as Paragraph;
  });
};

export const saveChatMessage = async (
  message: ChatMessages,
  sessionId: string
) => {
  try {
    await addDoc(collection(db, "sessions", sessionId, "chats"), {
      ...message,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
};

export const loadChatMessages = async (
  sessionId: string
): Promise<ChatMessages[]> => {
  const snapshot = await getDocs(
    collection(db, "sessions", sessionId, "chats")
  );
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ChatMessages[];
};

export const handleProcessingError = (context: string, error: unknown) => {
  console.error(`[${context}]`, error);
  let errorMessage = "An unexpected error occurred";
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }
};
