import { ChatMessages, DocumentChunk } from "@/types/page";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export const saveChunksToFirestore = async (
  sessionId: string,
  chunks: DocumentChunk[]
) => {
  const chunksCollection = collection(db, "sessions", sessionId, "chunks");

  const batch = writeBatch(db); // ⚡️ batching writes for performance

  chunks.forEach((chunk) => {
    const docRef = doc(chunksCollection);
    batch.set(docRef, {
      ...chunk,
      createdAt: serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    console.log("Chunks saved successfully");
  } catch (error) {
    console.error("Error saving chunks:", error);
    throw new Error("Failed to save chunks to Firestore");
  }
};

export const loadChunks = async (
  sessionId: string
): Promise<DocumentChunk[]> => {
  const querySnapshot = await getDocs(
    collection(db, "sessions", sessionId, "chunks")
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DocumentChunk[];
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
