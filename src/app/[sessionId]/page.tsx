"use client";

import useSessionStore from "@/store/session-store";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa6";
import { ChatWindow } from "@/components/follow-up-chat";
import { Attachment, Paragraph, Session, SummaryItem } from "@/types/page";
import { extractText } from "@/lib/extraction";
import { processTextToParagraphs } from "@/lib/chunk";
import { useToast } from "@/hooks/use-toast";
import { v7 } from "uuid";
import { WelcomeModal } from "@/components/InputModal";
import { useSearchParams } from "next/navigation";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import TopNavbar from "@/components/navbar";
import { FiSliders } from "react-icons/fi";
import { Sidebar } from "@/components/sidebar";
import { IoChatbox } from "react-icons/io5";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  deleteChatMessages,
  handleProcessingError,
  loadChatMessages,
  loadParagraphs,
  saveParagraphsToFirestore,
} from "@/lib/functions";
import { GoShieldLock } from "react-icons/go";
import { ChatSettingsModal } from "@/components/settings/chatSettings";
import { SummarySettingsModal } from "@/components/settings/summarySettings";
import SummaryDisplay from "@/components/summaryDisplay";
import { useAuthStore } from "@/store/auth-store";
import { summarizeParagraphs } from "@/lib/summary+api";
import { endTimer, logPerf, startTimer } from "@/lib/hi";
import { ThinkingLoader } from "@/components/ProgressStepper";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonBox } from "@/components/Skeleton";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import CitationView from "@/components/source-viewer";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [activeRightPanel, setActiveRightPanel] = useState<
    "chat" | "citation" | "closed"
  >("closed");
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);

  // Zustand store hooks
  const {
    activeSession,
    setActiveSession,
    isLoading,
    setIsLoading,
    isProcessingDocument,
    setIsProcessingDocument,
    loadingStates,
    setLoadingStates,
    inputText,
    setInputText,
    setUserInput,
    attachments,
    addAttachment,
    updateAttachment,
    removeAttachment,
    paragraphs,
    setParagraphs,
    summaries,
    setSummaries,
    chatMessages,
    setChatMessages,
    setIsChatCollapsed,
    isSidebarOpen,
    showChatSettingsModal,
    setShowChatSettingsModal,
    showSummarySettingsModal,
    setShowSummarySettingsModal,
    showWelcomeModal,
    setShowWelcomeModal,
  } = useSessionStore();

  const sessionIdRef = useRef<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const documentManager = useRef<{ [id: string]: number }>({});
  const nextDocumentIndex = useRef(1);
  const sessionInitialized = useRef(false);

  const isNew = searchParams.get("new") === "true";

  useEffect(() => {
    const initTimer = startTimer("SessionInitialization");

    if (!user) {
      logPerf("User not authenticated - redirecting to login");
      router.push("/login");
      return;
    }

    if (initialized) {
      endTimer(initTimer);
      return;
    }
    setInitialized(true);

    if (!sessionId) {
      logPerf("No SessionId");
      return;
    }

    if (isNew) {
      logPerf("Creating new session");
      createNewSession(sessionId);
      setShowWelcomeModal(true);
    } else {
      logPerf("Loading existing session");
      loadSessionData(sessionId);
    }

    endTimer(initTimer);
  }, [user, sessionId, isNew]);

  const createNewSession = useCallback(
    async (id: string) => {
      try {
        const sessionRef = doc(db, "sessions", id);
        const existing = await getDoc(sessionRef);
        if (existing.exists()) {
          console.log("Session already exists, skipping creation:", id);
          setActiveSession(existing.data() as Session);
          router.replace(`/${id}`);
          return;
        }

        const newSession: Session = {
          id,
          userId: user!.uid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: user!.email ?? "Unknown",
          owner: user!.email ?? "Unknown",
          sharedWith: [],
          folder: "private",
          isStarred: false,
          noOfAttachments: 0,
          title: "New Session",
        };

        await setDoc(sessionRef, newSession);
        setActiveSession(newSession);
        console.log("New session created:", newSession.id);
        router.replace(`/${id}`);
      } catch (error) {
        handleProcessingError("Create Session", error);
        toast({
          variant: "destructive",
          title: "Error creating session",
          description: "Failed to initialize new session",
        });
      }
    },
    [user, setActiveSession, toast, router]
  );

  const loadSessionData = useCallback(
    async (id: string) => {
      const loadTimer = startTimer("LoadSessionData");
      logPerf("Starting session load", { id });
      if (sessionInitialized.current) return;
      sessionInitialized.current = true;

      console.log("Loading session data for:", id);

      setLoadingStates({ ...loadingStates, session: true });

      try {
        const docTimer = startTimer("FirestoreGetDoc");
        const sessionRef = doc(db, "sessions", id);
        const sessionDoc = await getDoc(sessionRef);

        endTimer(docTimer);

        logPerf("Session document loaded", {
          exists: sessionDoc.exists(),
          size: JSON.stringify(sessionDoc.data())?.length,
        });

        if (!sessionDoc.exists()) {
          toast({
            title: "Session not found",
            description: "The requested session could not be found.",
          });
          return;
        }

        console.log("Session data loaded:", sessionDoc.id);
        console.log(
          `SessionData: ${JSON.stringify(sessionDoc.data(), null, 2)}`
        );
        const sessionData = sessionDoc.data() as Session;

        if (
          sessionData.userId !== user?.uid &&
          !sessionData.sharedWith?.includes(user?.email ?? "")
        ) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this session.",
            variant: "destructive",
          });
          router.push("/");
          return;
        }

        setActiveSession(sessionData);
        sessionIdRef.current = id;

        // Remove any query parameters
        router.replace(`/${id}`);

        if (sessionData.summaries) {
          const summaryData = Array.isArray(sessionData.summaries)
            ? sessionData.summaries[0]
            : sessionData.summaries;
          setSummaries(summaryData ?? null);
        }

        if (sessionData.userInput) setUserInput(sessionData.userInput);

        // Only load paragraphs if user is owner
        if (sessionData.userId === user?.uid) {
          const paraTimer = startTimer("LoadParagraphs");
          const loadedParagraphs = await loadParagraphs(id);
          const loadedChatMessages = await loadChatMessages(id);
          setChatMessages(loadedChatMessages);
          endTimer(paraTimer);
          logPerf("Paragraphs loaded", { count: loadedParagraphs.length });
          setParagraphs(loadedParagraphs);
        }
      } catch (error) {
        logPerf("Session load error", { error });
        handleProcessingError("Load Session Data", error);
        router.push("/");
      } finally {
        setLoadingStates({ ...loadingStates, session: false });
        logPerf("Session load completed");
        endTimer(loadTimer);
      }
    },
    [user, setActiveSession, setSummaries, setUserInput, toast, router]
  );

  // Derived state for shared session
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
      const result = await summarizeParagraphs(
        inputTextParagraphs,
        (progress) => {
          logPerf("Summarization progress", { progress });
          setExtractionProgress(progress);
        }
      );
      endTimer(summarizeTimer);
      logPerf("Summarization completed", result);
      setSummaries(result);
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
      const sessionId = sessionIdRef.current;
      if (!sessionId || !activeSession) return;

      try {
        const sessionRef = doc(db, "sessions", sessionId);

        setActiveSession({
          ...activeSession,
          title: result.title || "not found",
        });

        await updateDoc(sessionRef, {
          summaries: result,
          updatedAt: serverTimestamp(),
          noOfAttachments: attachments.length,
          title: result.title || "not found",
        });

        await saveParagraphsToFirestore(sessionId, allParagraphs);
      } catch (error) {
        handleProcessingError("Finalize Processing", error);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Failed to save session data",
        });
      } finally {
        console.log("Session data saved successfully");
      }
    },
    [inputText, attachments, activeSession, setActiveSession, setInputText]
  );

  const handleFileAdded = useCallback(
    async (file: File) => {
      const fileTimer = startTimer(`ProcessFile-${file.name}`);
      logPerf("Starting file processing", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      setIsProcessingDocument(true);
      setProgressMessage(`Processing ${file.name}...`);

      const id = v7();
      const newAttachment: Attachment = {
        id,
        file,
        name: file.name,
        type: file.type.split("/")[0] || "document",
        status: "uploading",
      };

      addAttachment(newAttachment);
      documentManager.current[id] = nextDocumentIndex.current++;

      try {
        const extractTimer = startTimer(`TextExtraction-${file.name}`);
        const text = await extractText(file, (progress, message) => {
          logPerf("Extraction progress", {
            file: file.name,
            progress,
            message,
          });
          setExtractionProgress(progress);
          setProgressMessage(message || `Processing ${file.name}...`);
        });
        endTimer(extractTimer);
        logPerf("Text extraction completed", { length: text.length });

        updateAttachment(id, { status: "extracted", text });
        return text;
      } catch (error: any) {
        logPerf("File processing error", { file: file.name, error });
        updateAttachment(id, { status: "error", error: error.message });
        throw error;
      } finally {
        setIsProcessingDocument(false);
        logPerf("File processing completed", { name: file.name });
        endTimer(fileTimer);
      }
    },
    [addAttachment, updateAttachment, setIsProcessingDocument]
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
              className="flex-1 min-h-0 overflow-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              <div ref={summaryRef} className="p-6">
                <AnimatePresence mode="wait">
                  {/* Initial loading state (session data) */}
                  {loadingStates.session ? (
                    <motion.div
                      key="session-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <SkeletonBox className="h-6 w-3/4" />
                      <SkeletonBox className="h-4 w-full" />
                      <SkeletonBox className="h-4 w-5/6" />
                      <SkeletonBox className="h-6 w-1/2 mt-8" />
                      <SkeletonBox className="h-4 w-full" />
                    </motion.div>
                  ) : isSummarizing ? (
                    <motion.div
                      key="summarizing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <ThinkingLoader
                        isSummarizing={isSummarizing}
                        paragraphsCount={paragraphCount}
                      />
                    </motion.div>
                  ) : !summaries && user?.uid === activeSession?.userId ? (
                    <motion.div
                      key="no-summary"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center justify-center h-full text-center p-8"
                    >
                      <div className="text-gray-500 mb-4">
                        No summary yet. Get started by adding content.
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowWelcomeModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      >
                        Get Started
                      </motion.button>
                    </motion.div>
                  ) : summaries ? (
                    <motion.div
                      key="summary-content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      <SummaryDisplay
                        paragraphs={paragraphs}
                        summary={summaries}
                        onCitationClick={handleCitationClick}
                      />
                    </motion.div>
                  ) : user?.uid !== activeSession?.userId ? (
                    <motion.div
                      key="no-access"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center h-full text-gray-500"
                    >
                      No summary available for this shared session
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </main>

        <AnimatePresence mode="wait">
          {activeRightPanel !== "closed" ? (
            <motion.aside
              key="right-panel-open"
              transition={{ duration: 0.2 }}
              className={`border-none bg-white rounded-lg mx-4 mb-4 flex flex-col ${
                activeRightPanel === "chat" ? "w-1/4" : "w-1/3"
              }`}
            >
              {activeRightPanel === "chat" ? (
                // Chat Window
                <>
                  <div className="z-10 border-b flex items-center justify-between">
                    <div className="flex items-center justify-start gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <BsLayoutSidebarInsetReverse
                          className="cursor-pointer m-2 text-gray-600"
                          size={24}
                          onClick={closeRightPanel}
                        />
                      </motion.div>
                      <div className="p-4 font-medium">Chat</div>
                    </div>
                    <div className="flex items-center justify-start">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <AlertDialog
                          open={deleteDialogOpen}
                          onOpenChange={setDeleteDialogOpen}
                        >
                          <AlertDialogTrigger asChild>
                            <FaTrash
                              size={18}
                              className="text-gray-600 hover:text-red-600 m-2"
                            />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Chats</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete your
                                conversation? This action cannot be undone.{" "}
                                <span className="hover:underline cursor-pointer text-blue-600">
                                  Read our data policy
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={handleDeleteChats}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiSliders
                          size={18}
                          className="m-2 text-gray-600 cursor-pointer hover:text-black"
                          onClick={() => setShowChatSettingsModal(true)}
                        />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-auto">
                    {loadingStates.session ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 space-y-3"
                      >
                        <SkeletonBox className="h-4 w-3/4" />
                        <SkeletonBox className="h-4 w-1/2" />
                        <SkeletonBox className="h-32 w-full mt-4" />
                        <SkeletonBox className="h-8 w-full mt-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="p-4 flex flex-col h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <ChatWindow
                          chatMessages={chatMessages}
                          setChatMessages={setChatMessages}
                          setIsChatCollapsed={setIsChatCollapsed}
                          key={sessionId}
                          sessionId={sessionId!}
                          summary={summaries}
                        />
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <CitationView
                  sourceId={currentSourceId}
                  paragraphs={paragraphs}
                  onClose={closeRightPanel}
                  title={summaries?.title || "Sources"}
                />
              )}
            </motion.aside>
          ) : (
            <motion.aside
              key="right-panel-closed"
              transition={{ duration: 0.2 }}
              className="w-14 border-none bg-white rounded-lg mx-4 mb-4 flex flex-col"
            >
              <div className="z-10 border-b flex items-center py-2 justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoChatbox
                    className="cursor-pointer m-2 text-gray-600"
                    size={24}
                    onClick={toggleChat}
                  />
                </motion.div>
              </div>
              <div className="flex-1 overflow-auto p-4"> </div>
            </motion.aside>
          )}
        </AnimatePresence>
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
