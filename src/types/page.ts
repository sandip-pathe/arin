import { Timestamp } from "firebase/firestore";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Array<{ name: string; type: string }>;
  summaries?: SummaryItem[]; // Changed from summary
  timestamp: Date;
};

export type ChatMessages = {
  id: string;
  role: string;
  content: string;
};

export type SummaryItem = {
  summary: string;
  legalOntology: Ontology;
  chunkIds: string;
};

export type Ontology = {
  definitions: string[];
  obligations: string[];
  rights: string[];
  conditions: string[];
  clauses: string[];
  dates: string[];
  parties: string[];
};

export type Attachment = {
  id: string;
  file: File;
  name: string;
  type: string;
  status: "uploading" | "extracted" | "error";
  text?: string;
  error?: string;
};

export type DocumentChunk = {
  id: string;
  content: string;
  sectionTitle?: string;
  tokenEstimate: number;
  documentId: string;
  documentName: string;
};

export type Chunk = {
  id: string;
  content: string;
  documentId: string;
  documentName: string;
};

export type Session = {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
  summaries?: SummaryItem[];
  messages: Message[];
  title?: string;
};
