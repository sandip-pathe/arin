import { Timestamp } from "firebase/firestore";

export type ChatMessages = {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
};

export type Summary = {
  text: string;
  sourceParagraphs: string[];
};

export type SummaryItem = {
  title?: string;
  summary: Summary[];
  legalOntology: Ontology;
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
  file?: File;
  name: string;
  type: string;
  status: "uploading" | "extracted" | "error";
  text?: string;
  error?: string;
};

export type Paragraph = {
  id: string;
  text: string;
  markdown?: string;
  html?: any;
  sectionTitle?: string;
};

export type DocumentChunk = {
  id: string;
  paragraphs: Paragraph[];
  sectionTitle?: string;
  tokenEstimate: number;
};

export type Session = {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  owner: string;
  sharedWith: string[];
  isStarred: boolean;
  folder?: string;
  noOfAttachments?: number;
  attachments?: Attachment[];
  summaries?: SummaryItem[];
  chunks?: DocumentChunk[];
  chats?: ChatMessages[];
  title?: string;
  userInput?: string;
};

export type SidebarItem = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
};

export type SidebarProps = {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  isSidebarExpanded: boolean;
  isManuallyExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  handleToggleSidebar: () => void;
  sessions: MinimalSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
};

export type MinimalSession = {
  id: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
  userId: string;
  isStarred: boolean;
  noOfAttachments: number;
  folder: string;
  sharedWith: string[];
  owner: string;
};
