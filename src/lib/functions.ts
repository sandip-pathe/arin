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

const createParagraphId = (
  docIndex: number,
  chunkIndex: number,
  paragraphIndex: number
) => `d${docIndex}.c${chunkIndex}.p${paragraphIndex}`;

export const saveParagraphsToFirestore = async (
  sessionId: string,
  documentChunks: DocumentChunk[],
  docIndex: number = 1 // Optional for future multi-document support
) => {
  if (documentChunks.length === 0) {
    console.warn("No chunks to save");
    return;
  }

  const paragraphCollection = collection(
    db,
    "sessions",
    sessionId,
    "paragraphs"
  );
  const batch = writeBatch(db);
  let totalParagraphs = 0;

  documentChunks.forEach((chunk, chunkIndex) => {
    chunk.paragraphs.forEach((para, paragraphIndex) => {
      const paragraphId = createParagraphId(
        docIndex,
        chunkIndex,
        paragraphIndex
      );
      const paragraphRef = doc(paragraphCollection, paragraphId);

      const estimatedTokens = Math.ceil(para.text.length / 4);

      const data = {
        id: paragraphId,
        text: para.text,
        sectionTitle: chunk.sectionTitle ?? null,
        tokenEstimate: estimatedTokens,
        createdAt: serverTimestamp(),
      };

      batch.set(paragraphRef, data);
      totalParagraphs++;
    });
  });

  try {
    await batch.commit();
    console.log(`Saved ${totalParagraphs} paragraphs to Firestore`);
  } catch (error) {
    console.error("Error saving paragraphs:", error);
    throw new Error("Failed to save paragraphs to Firestore");
  }
};

export const loadParagraphs = async (
  sessionId: string
): Promise<Paragraph[]> => {
  const paragraphsRef = collection(db, "sessions", sessionId, "paragraphs");
  const snapshot = await getDocs(paragraphsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      text: data.text,
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
