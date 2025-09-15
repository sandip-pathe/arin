// store/session-store.ts
import { create } from "zustand";
import {
  Attachment,
  DocumentChunk,
  SummaryItem,
  Session,
  ChatMessages,
  Paragraph,
} from "@/types/page";

interface SessionState {
  // State variables
  chatMessages: ChatMessages[];
  context: string;
  activeSession: Session | null;
  isLoading: boolean;
  isProcessingDocument: boolean;
  loadingStates: {
    chunks?: boolean;
    chats?: boolean;
    session?: boolean;
    summary?: boolean;
  };
  isProcessingChat: boolean;
  inputText: string;
  userInput: string;
  attachments: Attachment[];
  paragraphs: Paragraph[];
  chunks: DocumentChunk[];
  summaries: SummaryItem | null;
  quickSummary: string | null;
  isInputCollapsed: boolean;
  isChatCollapsed: boolean;
  showWelcomeModal: boolean;
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  showSettingsModal: boolean;
  showSummarySettingsModal: boolean;
  showChatSettingsModal: boolean;
  showAccountModal: boolean;
  showMembershipModal: boolean;
  showShareModal: boolean;

  // Actions
  setChatMessages: (
    messages: ChatMessages[] | ((prev: ChatMessages[]) => ChatMessages[])
  ) => void;
  setContext: (context: string) => void;
  setActiveSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsProcessingDocument: (isProcessing: boolean) => void;
  setLoadingStates: (loadingStates: {
    chunks?: boolean;
    chats?: boolean;
    session?: boolean;
    summary?: boolean;
  }) => void;
  setIsProcessingChat: (isProcessing: boolean) => void;
  setInputText: (text: string) => void;
  setUserInput: (text: string) => void;
  setAttachments: (attachments: Attachment[]) => void;
  setParagraphs: (paragraphs: Paragraph[]) => void;
  setChunks: (chunks: DocumentChunk[]) => void;
  setSummaries: (summary: SummaryItem | null) => void;
  setQuickSummary: (skim: string | null) => void;
  setIsInputCollapsed: (collapsed: boolean) => void;
  setIsChatCollapsed: (collapsed: boolean) => void;
  setShowWelcomeModal: (show: boolean) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowSummarySettingsModal: (show: boolean) => void;
  setShowChatSettingsModal: (show: boolean) => void;
  setShowAccountModal: (show: boolean) => void;
  setShowMembershipModal: (show: boolean) => void;
  setShowShareModal: (show: boolean) => void;

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
  loadingStates: {
    chunks: false,
    chats: false,
    session: false,
    summary: false,
  },
  isProcessingChat: false,
  inputText: "",
  userInput: "",
  attachments: [],
  paragraphs: [],
  chunks: [],
  summaries: null,
  quickSummary: null,
  isInputCollapsed: false,
  isChatCollapsed: false,
  showWelcomeModal: false,
  isSidebarOpen: false,
  isChatOpen: true,
  showSettingsModal: false,
  showSummarySettingsModal: false,
  showChatSettingsModal: false,
  showAccountModal: false,
  showMembershipModal: false,
  showShareModal: false,
  // Actions

  // Setters
  setChatMessages: (updater) =>
    set((state) => ({
      chatMessages:
        typeof updater === "function"
          ? updater(state.chatMessages ?? [])
          : updater,
    })),
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
  setParagraphs: (paragraphs) => set({ paragraphs }),
  setChunks: (chunks) => set({ chunks }),
  setSummaries: (summaries) => set({ summaries }),
  setQuickSummary: (quickSummary) => set({ quickSummary }),
  setIsInputCollapsed: (isInputCollapsed) => set({ isInputCollapsed }),
  setIsChatCollapsed: (isChatCollapsed) => set({ isChatCollapsed }),
  setShowWelcomeModal: (showWelcomeModal) => set({ showWelcomeModal }),
  setShowSettingsModal: (showSettingsModal) => set({ showSettingsModal }),
  setShowSummarySettingsModal: (showSummarySettingsModal) =>
    set({ showSummarySettingsModal }),
  setShowChatSettingsModal: (showChatSettingsModal) =>
    set({ showChatSettingsModal }),
  setShowAccountModal: (showAccountModal) => set({ showAccountModal }),
  setShowMembershipModal: (showMembershipModal) => set({ showMembershipModal }),
  setShowShareModal: (showShareModal) => set({ showShareModal }),
  // Toggle actions
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
      paragraphs: state.paragraphs.filter((p) => p.id !== id),
    })),

  resetSessionState: () =>
    set({
      attachments: [],
      paragraphs: [],
      summaries: null,
      quickSummary: null,
      context: "",
      inputText: "",
      isInputCollapsed: false,
      chatMessages: [],
      activeSession: null,
      isLoading: false,
      isProcessingDocument: false,
      loadingStates: {
        chunks: false,
        chats: false,
        session: false,
        summary: false,
      },
      isProcessingChat: false,
      userInput: "",
    }),
}));

export default useSessionStore;
