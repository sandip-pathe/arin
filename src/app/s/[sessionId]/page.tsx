"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeModal } from "@/components/InputModal";
import { ChatSettingsModal } from "@/components/settings/chatSettings";
import { SummarySettingsModal } from "@/components/settings/summarySettings";
import { Sidebar } from "@/components/sidebar";
import { GoShieldLock } from "react-icons/go";
import { processTextToParagraphs } from "@/lib/chunk";
import { quickSkimSummary, summarizeParagraphs } from "@/lib/summary+api";
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
import { documentManager, nextDocumentIndex } from "@/lib/document-refs";
import { HiOutlineMenu } from "react-icons/hi";
import Logo from "@/components/logo";

export default function SessionPage() {
  const { sessionId, activeSession, createNewSession, loadSessionData } =
    useSessionData();
  const { extractionProgress, progressMessage, handleFileAdded } =
    useFileProcessing();
  const { toast } = useToast();
  const { user, membership, updateMembership, loading } = useAuthStore();
  const searchParams = useSearchParams();
  const DEMO_SESSION_ID = "019906c6-4987-77cd-bc27-ae252025c373";

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
    toggleSidebar,
    showChatSettingsModal,
    setShowChatSettingsModal,
    showSummarySettingsModal,
    setShowSummarySettingsModal,
    showWelcomeModal,
    setShowWelcomeModal,
    quickSummary,
    setQuickSummary,
  } = useSessionStore();

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [activeRightPanel, setActiveRightPanel] = useState<
    "chat" | "citation" | "closed"
  >("closed");
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const isNew = searchParams.get("new") === "true";
  const router = useRouter();

  const handleUseSampleDoc = async () => {
    setShowWelcomeModal(false);
    setIsSummarizing(true);
    setParagraphCount(2);
    setTimeout(() => {
      setIsSummarizing(false);
      router.push(`/s/${DEMO_SESSION_ID}`);
    }, 10000);
  };

  useEffect(() => {
    if (loading) {
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

      const skimParagraphs = inputTextParagraphs.slice(0, 10);

      const quickSkimPromise = (async () => {
        const quickSkimTimer = startTimer("QuickSkim");
        try {
          const skim = await quickSkimSummary(skimParagraphs);
          setQuickSummary(skim);
        } catch (err: any) {
          logPerf("Quick skim error (non-fatal)", { error: err.message });
        } finally {
          endTimer(quickSkimTimer);
        }
      })();

      const fullSummaryPromise = (async () => {
        const summarizeTimer = startTimer("Summarization");
        try {
          const result = await summarizeParagraphs(inputTextParagraphs);
          endTimer(summarizeTimer);
          console.log(summarizeTimer, "summary completed in");

          logPerf("Summarization completed", result);
          setSummaries(result);
          setActiveSession({
            ...activeSession!,
            title: result.title || "Legal Session",
          });

          setParagraphs(inputTextParagraphs);

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
          setIsSummarizing(false);
        }
      })();

      // --- STEP 3: Let both run independently ---
      await Promise.allSettled([quickSkimPromise, fullSummaryPromise]);
    } catch (err: any) {
      logPerf("HandleSend error", { error: err.message });
      handleProcessingError("Processing failed", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `${err.message}`,
      });
    } finally {
      setIsLoading(false);
      endTimer(sendTimer);
      logPerf("HandleSend completed");
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
          instantSummary: quickSummary,
        });

        updateMembership?.({
          pagesRemaining:
            (membership.pagesRemaining ?? 0) -
            (attachments.length + (inputText ? 1 : 0)),
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
      <div className="flex flex-col items-center bg-[#edeffa] shadow-none select-none p-2 md:p-0 lg:pl-0 lg:flex-row lg:items-center lg:ml-4 lg:mb-4 lg:justify-start">
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md"
        >
          <HiOutlineMenu size={24} className="text-gray-600" />
        </button>
        <div className="lg:hidden flex flex-col items-center mt-2 mb-1">
          <Logo />
        </div>

        {/* Session Title */}
        <div className="lg:flex lg:items-center">
          <div className="hidden lg:flex lg:items-center lg:mr-4">
            <Logo />
          </div>
          <motion.h2 className="text-lg font-semibold text-gray-800 text-center lg:text-left line-clamp-2 lg:line-clamp-none lg:truncate max-w-[200px] md:max-w-none mx-2 lg:ml-0">
            {typeof activeSession?.title === "string"
              ? activeSession.title
              : "Untitled"}
          </motion.h2>
          {isSharedWithUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center mt-1 lg:mt-0 lg:ml-2 px-2 py-1 rounded-lg bg-white shrink-0"
            >
              <GoShieldLock className="font-semibold" size={18} />
              <span className="text-sm ml-1 font-semibold hidden sm:block">
                Shared with you
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-visible flex-col lg:flex-row">
        <Sidebar sessionId={sessionId!} />

        <main className="flex-1 min-w-0 mb-4 overflow-hidden">
          <motion.div className="flex flex-col h-full overflow-hidden border-none lg:rounded-xl bg-white">
            <div className="z-10 border-b flex items-center justify-between py-2">
              <div className="flex items-center justify-between w-full">
                <div className="p-2 ml-10 font-medium">
                  Briefs and Key Information
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
              onUseSampleDoc={handleUseSampleDoc}
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
