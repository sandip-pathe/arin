import { MutableRefObject } from "react";

// Map of attachmentId → documentIndex
export const documentManager: MutableRefObject<Record<string, number>> = {
  current: {},
};

// Tracks next available index
export const nextDocumentIndex: MutableRefObject<number> = {
  current: 1,
};

export const resetDocuments = () => {
  documentManager.current = {};
  nextDocumentIndex.current = 1;
};
