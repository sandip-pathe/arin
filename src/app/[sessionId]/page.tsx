"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeModal } from "@/components/InputModal";
import { ChatSettingsModal } from "@/components/settings/chatSettings";
import { SummarySettingsModal } from "@/components/settings/summarySettings";
import TopNavbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { GoShieldLock } from "react-icons/go";
import { processTextToParagraphs } from "@/lib/chunk";
import { summarizeParagraphs } from "@/lib/summary+api";
import {
  saveParagraphsToFirestore,
  deleteChatMessages,
  handleProcessingError,
} from "@/lib/functions";
import { startTimer, endTimer, logPerf } from "@/lib/hi";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { updateDoc, serverTimestamp, doc } from "firebase/firestore";
import { useSessionData } from "@/hooks/use-session-data";
import { useFileProcessing } from "@/hooks/use-file-process";
import { useAuthStore } from "@/store/auth-store";
import useSessionStore from "@/store/session-store";
import { Paragraph, SummaryItem } from "@/types/page";
import { FiSliders } from "react-icons/fi";
import { RightPanel } from "@/components/right-panel";
import { MainContent } from "@/components/main";

export default function SessionPage() {
  const { sessionId, activeSession, createNewSession, loadSessionData } =
    useSessionData();
  const { extractionProgress, progressMessage, handleFileAdded } =
    useFileProcessing();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();

  const {
    setActiveSession,
    isLoading,
    setIsLoading,
    isProcessingDocument,
    inputText,
    setInputText,
    attachments,
    removeAttachment,
    paragraphs,
    setParagraphs,
    summaries,
    setSummaries,
    setChatMessages,
    isSidebarOpen,
    showChatSettingsModal,
    setShowChatSettingsModal,
    showSummarySettingsModal,
    setShowSummarySettingsModal,
    showWelcomeModal,
    setShowWelcomeModal,
  } = useSessionStore();

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [activeRightPanel, setActiveRightPanel] = useState<
    "chat" | "citation" | "closed"
  >("closed");
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const documentManager = useRef<{ [id: string]: number }>({});
  const nextDocumentIndex = useRef(1);
  const isNew = searchParams.get("new") === "true";
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (initialized || !sessionId) {
      return;
    }
    setInitialized(true);

    if (isNew) {
      createNewSession(sessionId);
      setShowWelcomeModal(true);
    } else {
      loadSessionData(sessionId);
    }
  }, [user, sessionId, isNew, initialized]);

  const isSharedWithUser = useMemo(() => {
    if (!activeSession || !user) return false;
    return (
      activeSession.owner !== user?.email &&
      activeSession.sharedWith?.includes(user?.email ?? "")
    );
  }, [activeSession, user]);

  const handleSend = useCallback(async () => {
    const sendTimer = startTimer("HandleSend");
    if (isProcessingDocument || isLoading) return;
    setIsLoading(true);
    setIsSummarizing(true);
    try {
      const inputTimer = startTimer("ProcessInputs");
      const inputTextParagraphs = await processAllInputs();
      setInputText("");
      setParagraphCount(inputTextParagraphs.length);
      setShowWelcomeModal(false);
      endTimer(inputTimer);
      logPerf("Input processing completed", {
        paragraphCount: inputTextParagraphs.length,
      });

      const summarizeTimer = startTimer("Summarization");
      const result = await summarizeParagraphs(inputTextParagraphs);
      endTimer(summarizeTimer);
      logPerf("Summarization completed", result);
      setSummaries(result);
      setActiveSession({
        ...activeSession!,
        title: result.title || "Legal Session",
      });

      setParagraphs(inputTextParagraphs);
      setIsSummarizing(false);
      const saveTimer = startTimer("FirestoreSave");
      await saveToFirestore(inputTextParagraphs, result);
      endTimer(saveTimer);
      logPerf("Firestore save completed");
    } catch (err: any) {
      logPerf("Summarization error", { error: err.message });
      handleProcessingError("Summarization failed", err);
      toast({
        variant: "destructive",
        title: "Summarization Error",
        description: `${err.message}`,
      });
    } finally {
      setIsLoading(false);
      logPerf("HandleSend completed");
      endTimer(sendTimer);
    }
  }, [
    isProcessingDocument,
    isLoading,
    inputText,
    attachments,
    paragraphs,
    summaries,
  ]);

  const processAllInputs = useCallback(async () => {
    const textParagraphs = inputText.trim()
      ? processTextToParagraphs(inputText.trim(), nextDocumentIndex.current++)
      : [];

    const fileParagraphs = await Promise.all(
      attachments.map((a) =>
        processTextToParagraphs(a.text || "", documentManager.current[a.id])
      )
    );

    return [...textParagraphs, ...fileParagraphs.flat()];
  }, [inputText, attachments]);

  const saveToFirestore = useCallback(
    async (allParagraphs: Paragraph[], result: SummaryItem) => {
      const sessionId = activeSession?.id;
      if (!sessionId) return;

      try {
        const sessionRef = doc(db, "sessions", sessionId);

        await updateDoc(sessionRef, {
          summaries: result,
          updatedAt: serverTimestamp(),
          noOfAttachments: attachments.length,
          title: result.title,
        });

        await saveParagraphsToFirestore(sessionId, allParagraphs);
      } catch (error) {
        handleProcessingError("Finalize Processing", error);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Failed to save session data",
        });
      }
    },
    [activeSession, attachments.length]
  );

  const handleRemoveAttachment = useCallback(
    async (id: string) => {
      removeAttachment(id);
      delete documentManager.current[id];
      const ids = Object.keys(documentManager.current).sort();
      documentManager.current = {};
      ids.forEach((aid, i) => (documentManager.current[aid] = i + 1));
      nextDocumentIndex.current = ids.length + 1;
    },
    [removeAttachment]
  );

  const handleDeleteChats = async () => {
    if (!sessionId) return;
    try {
      await deleteChatMessages(sessionId);
      setChatMessages([]);
      toast({
        title: "Chats Cleared",
        description: "All chat messages have been deleted.",
      });
    } catch (error) {
      console.error("Error deleting chats:", error);
      toast({
        title: "Error",
        description: "Failed to delete chats.",
        variant: "destructive",
      });
    }
  };

  const handleCitationClick = (id: string) => {
    setCurrentSourceId(id);
    setActiveRightPanel("citation");
  };

  const toggleChat = () => {
    if (activeRightPanel === "chat") {
      setActiveRightPanel("closed");
    } else {
      setActiveRightPanel("chat");
    }
  };

  const closeRightPanel = () => {
    setActiveRightPanel("closed");
  };

  return (
    <div className="flex flex-col h-screen bg-[#edeffa] text-foreground overflow-hidden">
      <div className="flex items-center justify-start bg-[#edeffa] shadow-none select-none">
        <TopNavbar isSidebarOpen={isSidebarOpen} />
        <motion.h2>
          {typeof activeSession?.title === "string"
            ? activeSession.title
            : "Untitled"}
        </motion.h2>
        {isSharedWithUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center ml-2 px-2 py-1 rounded-lg bg-white"
          >
            <GoShieldLock className="font-semibold" size={18} />
            <span className="text-sm ml-1 font-semibold">Shared with you</span>
          </motion.div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-visible">
        <Sidebar sessionId={sessionId!} />

        <main className="flex-1 min-w-0 mb-4 overflow-hidden">
          <motion.div className="flex flex-col h-full overflow-hidden border-none rounded-xl bg-white">
            <div className="z-10 border-b flex items-center justify-between py-2">
              <div className="flex items-center justify-between w-full">
                <div className="p-2 ml-10 font-medium">
                  Briefs & Legal Key Insights
                </div>
                {(activeSession?.noOfAttachments ?? 0) > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm mx-4"
                  >
                    {activeSession?.noOfAttachments ?? 0}{" "}
                    {activeSession?.noOfAttachments === 1
                      ? "attachment"
                      : "attachments"}
                  </motion.span>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSliders
                  size={18}
                  className="m-2 text-gray-600 cursor-pointer hover:text-black"
                  onClick={() => setShowSummarySettingsModal(true)}
                />
              </motion.div>
            </div>

            <div
              ref={summaryRef}
              className="flex-1 p-4 min-h-0 overflow-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              <AnimatePresence mode="wait">
                <MainContent
                  isSummarizing={isSummarizing}
                  paragraphCount={paragraphCount}
                  onCitationClick={handleCitationClick}
                  isSharedWithUser={isSharedWithUser}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        <RightPanel
          activeRightPanel={activeRightPanel}
          currentSourceId={currentSourceId}
          sessionId={sessionId!}
          onClose={closeRightPanel}
          onToggleChat={toggleChat}
          onCitationClick={handleCitationClick}
          onDeleteChats={handleDeleteChats}
        />
      </div>

      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeModal
              isOpen={showWelcomeModal}
              onOpenChange={setShowWelcomeModal}
              inputText={inputText}
              onInputTextChange={setInputText}
              attachments={attachments}
              onFileAdded={handleFileAdded}
              onRemoveAttachment={handleRemoveAttachment}
              onSend={handleSend}
              isProcessing={isProcessingDocument}
              extractionProgress={extractionProgress}
              progressMessage={progressMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChatSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChatSettingsModal
              isOpen={showChatSettingsModal}
              onOpenChange={setShowChatSettingsModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummarySettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SummarySettingsModal
              isOpen={showSummarySettingsModal}
              onOpenChange={setShowSummarySettingsModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
