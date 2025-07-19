// store/session-store.ts
import { create } from "zustand";
import {
  Attachment,
  DocumentChunk,
  SummaryItem,
  Session,
  ChatMessages,
} from "@/types/page";

interface SessionState {
  // State variables
  chatMessages: ChatMessages[];
  context: string;
  activeSession: Session | null;
  isLoading: boolean;
  isProcessingDocument: boolean;
  loadingStates: { chunks: boolean; chats: boolean; session: boolean };
  isProcessingChat: boolean;
  inputText: string;
  userInput: string;
  attachments: Attachment[];
  chunks: DocumentChunk[];
  summaries: SummaryItem[];
  isInputCollapsed: boolean;
  isChatCollapsed: boolean;
  showWelcomeModal: boolean;
  isSidebarOpen: boolean;
  isChatOpen: boolean;

  // Actions
  setChatMessages: (messages: ChatMessages[]) => void;
  setContext: (context: string) => void;
  setActiveSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsProcessingDocument: (isProcessing: boolean) => void;
  setLoadingStates: (loadingStates: {
    chunks: boolean;
    chats: boolean;
    session: boolean;
  }) => void;
  setIsProcessingChat: (isProcessing: boolean) => void;
  setInputText: (text: string) => void;
  setUserInput: (text: string) => void;
  setAttachments: (attachments: Attachment[]) => void;
  setChunks: (chunks: DocumentChunk[]) => void;
  setSummaries: (summaries: SummaryItem[]) => void;
  setIsInputCollapsed: (collapsed: boolean) => void;
  setIsChatCollapsed: (collapsed: boolean) => void;
  setShowWelcomeModal: (show: boolean) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;

  // Complex actions
  addAttachment: (attachment: Attachment) => void;
  updateAttachment: (id: string, update: Partial<Attachment>) => void;
  removeAttachment: (id: string) => void;
  resetSessionState: () => void;
}

const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  chatMessages: [],
  context: "",
  activeSession: null,
  isLoading: false,
  isProcessingDocument: false,
  loadingStates: { chunks: false, chats: false, session: false },
  isProcessingChat: false,
  inputText: "",
  userInput: "",
  attachments: [],
  chunks: [],
  summaries: [],
  isInputCollapsed: false,
  isChatCollapsed: false,
  showWelcomeModal: false,
  isSidebarOpen: false,
  isChatOpen: true,

  // Setters
  setChatMessages: (chatMessages) => set({ chatMessages }),
  setContext: (context) => set({ context }),
  setActiveSession: (activeSession) => set({ activeSession }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsProcessingDocument: (isProcessingDocument) =>
    set({ isProcessingDocument }),
  setLoadingStates: (loadingStates) => set({ loadingStates }),
  setIsProcessingChat: (isProcessingChat) => set({ isProcessingChat }),
  setInputText: (inputText) => set({ inputText }),
  setUserInput: (userInput) => set({ userInput }),
  setAttachments: (attachments) => set({ attachments }),
  setChunks: (chunks) => set({ chunks }),
  setSummaries: (summaries) => set({ summaries }),
  setIsInputCollapsed: (isInputCollapsed) => set({ isInputCollapsed }),
  setIsChatCollapsed: (isChatCollapsed) => set({ isChatCollapsed }),
  setShowWelcomeModal: (showWelcomeModal) => set({ showWelcomeModal }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Complex actions
  addAttachment: (attachment) =>
    set((state) => ({ attachments: [...state.attachments, attachment] })),

  updateAttachment: (id, update) =>
    set((state) => ({
      attachments: state.attachments.map((a) =>
        a.id === id ? { ...a, ...update } : a
      ),
    })),

  removeAttachment: (id) =>
    set((state) => ({
      attachments: state.attachments.filter((a) => a.id !== id),
      chunks: state.chunks.filter((c) => c.documentId !== id),
    })),

  resetSessionState: () =>
    set({
      attachments: [],
      chunks: [],
      summaries: [],
      inputText: "",
      isInputCollapsed: false,
    }),
}));

export default useSessionStore;
