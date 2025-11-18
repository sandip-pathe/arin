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
import { FiSliders, FiDownload } from "react-icons/fi";
import { RightPanel } from "@/components/right-panel";
import {
  exportToMarkdown,
  exportToText,
  exportToPDF,
} from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [summaryProgress, setSummaryProgress] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [activeRightPanel, setActiveRightPanel] = useState<
    "chat" | "citation" | "closed"
  >("closed");
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
    }, 9000); // simulate processing time
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
    setSummaryProgress(0);
    try {
      const inputTimer = startTimer("ProcessInputs");
      const inputTextParagraphs = await processAllInputs();
      const hadInputText = Boolean(inputText.trim());
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
          return skim;
        } catch (err: any) {
          logPerf("Quick skim error (non-fatal)", { error: err.message });
          return "";
        } finally {
          endTimer(quickSkimTimer);
        }
      })();

      const fullSummaryPromise = (async () => {
        const summarizeTimer = startTimer("Summarization");
        try {
          const result = await summarizeParagraphs(
            inputTextParagraphs,
            (percent, phase, partial) => {
              // Update progress with phase information
              setSummaryProgress(percent);
              if (phase) {
                logPerf("Summary progress", { percent, phase });
              }
            }
          );

          setSummaries(result);
          setActiveSession({
            ...activeSession!,
            title: result.title || "Legal Session",
          });
          setParagraphs(inputTextParagraphs);

          const skim = await quickSkimPromise; // ✅ wait for skim result
          await saveToFirestore(
            inputTextParagraphs,
            result,
            skim,
            hadInputText
          );

          // Trigger login modal after 1 minute for anonymous users
          if (!user) {
            setTimeout(() => {
              const { open, incrementAnonymousSession } =
                require("@/store/auth-modal-store").useAuthModalStore.getState();
              incrementAnonymousSession();
              open("signup", "limit_reached");
            }, 60000); // 60 seconds = 1 minute
          }
        } catch (err: any) {
          handleProcessingError("Summarization failed", err);
          toast({
            variant: "destructive",
            title: "Summarization Error",
            description: `${err.message}`,
          });
        } finally {
          setIsSummarizing(false);
          endTimer(summarizeTimer);
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
    // run expensive parsing on next tick to avoid blocking paint
    return await new Promise<Paragraph[]>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const textParagraphs = inputText.trim()
            ? processTextToParagraphs(
                inputText.trim(),
                nextDocumentIndex.current++
              )
            : [];

          const fileParagraphs = await Promise.all(
            attachments.map((a) =>
              processTextToParagraphs(
                a.text || "",
                documentManager.current[a.id]
              )
            )
          );

          resolve([...textParagraphs, ...fileParagraphs.flat()]);
        } catch (err) {
          // reject instead of throwing to properly surface to the caller
          reject(err);
        }
      }, 0);
    });
  }, [inputText, attachments]);

  const saveToFirestore = useCallback(
    async (
      allParagraphs: Paragraph[],
      result: SummaryItem,
      quickSummary: string,
      hadInputText: boolean
    ) => {
      const sessionId = activeSession?.id;
      if (!sessionId) return;

      // Track anonymous session in localStorage
      if (!user) {
        const { addAnonymousSessionId } = await import(
          "@/lib/session-migration"
        );
        addAnonymousSessionId(sessionId);
      }

      try {
        const sessionRef = doc(db, "sessions", sessionId);
        await updateDoc(sessionRef, {
          summaries: result,
          updatedAt: serverTimestamp(),
          noOfAttachments: attachments.length,
          title: result.title,
          quickSummary,
        });

        // Only update membership for authenticated users
        if (user && updateMembership) {
          updateMembership({
            pagesRemaining:
              (membership.pagesRemaining ?? 0) -
              (attachments.length + (hadInputText ? 1 : 0)),
          });
        }

        const LARGE_SAVE_THRESHOLD = 5;
        if (allParagraphs.length > LARGE_SAVE_THRESHOLD) {
          backgroundSaveParagraphs(sessionId, allParagraphs).catch((err) => {
            handleProcessingError("Background Firestore save failed", err);
          });
        } else {
          await saveParagraphsToFirestore(sessionId, allParagraphs);
        }
      } catch (error) {
        handleProcessingError("Finalize Processing", error);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Failed to save session data",
        });
      }
    },
    [
      activeSession,
      attachments.length,
      membership?.pagesRemaining,
      quickSummary,
    ]
  );

  // helper: background-chunked save with logging
  const backgroundSaveParagraphs = async (
    sessionId: string,
    paragraphsToSave: Paragraph[]
  ) => {
    const CHUNK = 300; // safe batch size
    for (let i = 0; i < paragraphsToSave.length; i += CHUNK) {
      const chunk = paragraphsToSave.slice(i, i + CHUNK);
      try {
        // assume saveParagraphsToFirestore can accept chunked sets
        await saveParagraphsToFirestore(sessionId, chunk);
      } catch (err) {
        // log + surface minimal toast so user knows save failed in background
        console.error("Background chunk save failed", {
          err,
          sessionId,
          chunkSize: chunk.length,
        });
        toast({
          title: "Background save failed",
          description:
            "We couldn't save some paragraphs. We'll retry automatically.",
          variant: "destructive",
        });
        // optionally continue (you may implement a retry scheduler elsewhere)
      }
    }
  };

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

  const handleExport = async (format: "pdf" | "markdown" | "text") => {
    if (!summaries || !activeSession?.title) {
      toast({
        title: "Nothing to export",
        description: "Please generate a summary first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      switch (format) {
        case "pdf":
          await exportToPDF(summaries, activeSession.title);
          break;
        case "markdown":
          exportToMarkdown(summaries, activeSession.title);
          break;
        case "text":
          exportToText(summaries, activeSession.title);
          break;
      }
      toast({
        title: "Export successful",
        description: `Downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#edeffa] text-foreground overflow-hidden">
      <div className="flex flex-col items-center bg-[#edeffa] shadow-none select-none p-2 pt-4 md:p-0 md:pt-4 lg:pl-0 lg:pt-4 lg:flex-row lg:items-center lg:ml-4 lg:mb-4 lg:justify-start">
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
              <div className="flex items-center gap-2">
                {summaries && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isExporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiDownload size={16} />
                        {isExporting ? "Exporting..." : "Export"}
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleExport("pdf")}
                        className="cursor-pointer"
                      >
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("markdown")}
                        className="cursor-pointer"
                      >
                        Export as Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("text")}
                        className="cursor-pointer"
                      >
                        Export as Text
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
                  summaryProgress={summaryProgress}
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
              onOpenChange={() => {
                router.replace("/");
                setShowWelcomeModal(false);
              }}
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
