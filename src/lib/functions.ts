import {
  ChatMessages,
  DocumentChunk,
  MinimalSession,
  Paragraph,
} from "@/types/page";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
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
    const paragraphRef = doc(paragraphCollection, para.id);

    batch.set(paragraphRef, {
      id: para.id,
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
  const q = query(
    collection(db, "sessions", sessionId, "chats"),
    orderBy("timestamp", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ChatMessages[];
};

// Add a function to delete chats
export const deleteChatMessages = async (sessionId: string) => {
  try {
    const chatsRef = collection(db, "sessions", sessionId, "chats");
    const snapshot = await getDocs(chatsRef);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error deleting chat messages:", error);
    throw error;
  }
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
