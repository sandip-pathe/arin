"use client";

import useSessionStore from "@/store/session-store";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa6";
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
  handleProcessingError,
  loadParagraphs,
  saveParagraphsToFirestore,
} from "@/lib/functions";
import { GoShieldLock } from "react-icons/go";
import { ChatSettingsModal } from "@/components/settings/chatSettings";
import { SummarySettingsModal } from "@/components/settings/summarySettings";
import SummaryDisplay from "@/components/summaryDisplay";
import { useAuthStore } from "@/store/auth-store";
import { summarizeParagraphs } from "@/lib/ChatGPT+api";
import { endTimer, logPerf, startTimer } from "@/lib/hi";
import { PerformanceMonitor } from "@/components/PERFORMANCE-monitor";
import { ThinkingLoader } from "@/components/ProgressStepper";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
  );
}

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
  const [thinkingStartTime, setThinkingStartTime] = useState(0);
  const [currentThinkingTime, setCurrentThinkingTime] = useState(0);

  // Zustand store hooks
  const {
    context,
    setContext,
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
    userInput,
    setUserInput,
    attachments,
    setAttachments,
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
    isChatOpen,
    toggleChat,
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
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Derived state for shared session
  const isSharedWithUser = useMemo(() => {
    if (!activeSession || !user) return false;
    return (
      activeSession.owner !== user?.email &&
      activeSession.sharedWith?.includes(user?.email ?? "")
    );
  }, [activeSession, user]);

  useEffect(() => {
    const initTimer = startTimer("SessionInitialization");
    if (user === null) {
      logPerf("User not authenticated - redirecting to login");
      router.push("/login");
      return;
    }

    if (initialized) {
      endTimer(initTimer);
      return;
    }
    setInitialized(true);

    const isNew = searchParams.get("new") === "true";
    logPerf(`Session initialization params`, { sessionId, isNew });

    if (!sessionId) {
      logPerf("Generating new session ID");
      const newId = v7();
      router.replace(`/${newId}?new=true`);
    } else if (isNew) {
      logPerf("Creating new session");
      createNewSession(sessionId);
      setShowWelcomeModal(true);
    } else {
      logPerf("Loading existing session");
      loadSessionData(sessionId);
    }
    endTimer(initTimer);
  }, [user, sessionId, searchParams]);

  const createNewSession = useCallback(
    async (id: string) => {
      sessionIdRef.current = id;

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

      try {
        await setDoc(doc(db, "sessions", id), newSession);
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
          console.log("Summaries found:", sessionData.summaries);

          // Handle both array and single object formats
          let summaryData;
          if (Array.isArray(sessionData.summaries)) {
            // For backward compatibility with old array format
            summaryData = sessionData.summaries[0];
          } else {
            // For new single object format
            summaryData = sessionData.summaries;
          }

          setSummaries(summaryData);
        }

        if (sessionData.userInput) setUserInput(sessionData.userInput);

        // Only load paragraphs if user is owner
        if (sessionData.userId === user?.uid) {
          const paraTimer = startTimer("LoadParagraphs");
          const loadedParagraphs = await loadParagraphs(id);
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
    [
      user,
      setActiveSession,
      setSummaries,
      setContext,
      setUserInput,
      toast,
      router,
    ]
  );

  const handleSend = useCallback(async () => {
    const sendTimer = startTimer("HandleSend");
    if (isProcessingDocument || isLoading) return;
    setIsLoading(true);
    setIsSummarizing(true);
    try {
      const inputTimer = startTimer("ProcessInputs");
      const inputTextParagraphs = await processAllInputs();
      setInputText("");
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
      logPerf("Summarization completed", { itemCount: result.summary.length });
      setSummaries(result);
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
      setIsLoading(false);
      setIsSummarizing(false);
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
          summaries: [result], // Wrap in array for backward compatibility if needed
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

  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }

    if (isSummarizing) {
      setThinkingStartTime(performance.now());
      thinkingIntervalRef.current = setInterval(() => {
        setCurrentThinkingTime(performance.now() - thinkingStartTime);
      }, 100);
    } else {
      setCurrentThinkingTime(0);
    }
  }, [isSummarizing]);

  const wordsCount = useMemo(() => {
    return paragraphs.reduce(
      (count, para) => count + para.text.split(/\s+/).length,
      0
    );
  }, [paragraphs]);

  return (
    <div className="flex flex-col h-screen bg-[#edeffa] text-foreground overflow-hidden">
      <PerformanceMonitor />
      <div className="flex items-center justify-start bg-[#edeffa] shadow-none select-none">
        <TopNavbar isSidebarOpen={isSidebarOpen} />
        <h2 className="m-1.5 ml-8 font-semibold text-xl text-gray-700">
          {activeSession?.title || "unknown"}
        </h2>
        {isSharedWithUser && (
          <div className="flex items-center ml-2 px-2 py-1 rounded-lg bg-white">
            <GoShieldLock className="font-semibold" size={18} />
            <span className="text-sm ml-1 font-semibold">Shared with you</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-visible">
        <Sidebar sessionId={sessionId!} />

        <main className="flex-1 min-w-0 mb-4 overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden border-none rounded-xl bg-white">
            <div className="z-10 border-b flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="p-2 ml-10 font-medium">Summary</div>
                {(activeSession?.noOfAttachments ?? 0) > 0 && (
                  <span className="text-sm mx-4">
                    {activeSession?.noOfAttachments ?? 0}{" "}
                    {activeSession?.noOfAttachments === 1
                      ? "attachment"
                      : "attachments"}
                  </span>
                )}
              </div>
              <FiSliders
                size={18}
                className="m-2 text-gray-600 cursor-pointer hover:text-black"
                onClick={() => setShowSummarySettingsModal(true)}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-auto scrollbar-thumb-gray-500 scrollbar-track-gray-100 scrollbar-thin">
              <div ref={summaryRef} className="p-6">
                {loadingStates.session ||
                loadingStates.summary ||
                isSummarizing ? (
                  <div className="space-y-6">
                    {isSummarizing && (
                      <ThinkingLoader
                        totalTime={currentThinkingTime}
                        paragraphsCount={paragraphs.length}
                        wordsCount={wordsCount}
                        currentModel="GPT-4o"
                      />
                    )}

                    {/* Show only one loader at a time */}
                    {!isSummarizing && (
                      <div className="space-y-4">
                        <SkeletonBox className="h-6 w-3/4" />
                        <SkeletonBox className="h-4 w-full" />
                        <SkeletonBox className="h-4 w-5/6" />
                        <SkeletonBox className="h-6 w-1/2 mt-8" />
                        <SkeletonBox className="h-4 w-full" />
                      </div>
                    )}
                  </div>
                ) : (
                  <SummaryDisplay
                    paragraphs={paragraphs}
                    summary={summaries}
                    loading={isSummarizing}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {isChatOpen ? (
          <aside className="w-1/4 border-none bg-white rounded-lg mx-4 mb-4 flex flex-col">
            <div className="z-10 border-b flex items-center justify-between">
              <div className="flex items-center justify-start gap-2">
                <BsLayoutSidebarInsetReverse
                  className="cursor-pointer m-2 text-gray-600"
                  size={24}
                  onClick={toggleChat}
                />
                <div className="p-4 font-medium">Chat</div>
              </div>
              <div className="flex items-center justify-start">
                <FaLock size={18} className="text-green-600 m-2" />
                <FiSliders
                  size={18}
                  className="m-2 text-gray-600 cursor-pointer hover:text-black"
                  onClick={() => setShowChatSettingsModal(true)}
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              {loadingStates.session || isLoading ? (
                <div className="p-4 space-y-3">
                  <SkeletonBox className="h-4 w-3/4" />
                  <SkeletonBox className="h-4 w-1/2" />
                  <SkeletonBox className="h-32 w-full mt-4" />
                  <SkeletonBox className="h-8 w-full mt-4" />
                </div>
              ) : (
                <ChatWindow
                  chatMessages={chatMessages}
                  setChatMessages={setChatMessages}
                  setIsChatCollapsed={setIsChatCollapsed}
                  key={sessionId}
                  sessionId={sessionId!}
                  context={context}
                />
              )}
            </div>
          </aside>
        ) : (
          <aside className="w-14 border-none bg-white rounded-lg mx-4 mb-4 flex flex-col">
            <div className="z-10 border-b flex items-center py-2 justify-center">
              <IoChatbox
                className="cursor-pointer m-2"
                size={24}
                onClick={toggleChat}
              />
            </div>
            <div className="flex-1 overflow-auto p-4"> </div>
          </aside>
        )}
      </div>

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

      <ChatSettingsModal
        isOpen={showChatSettingsModal}
        onOpenChange={setShowChatSettingsModal}
      />

      <SummarySettingsModal
        isOpen={showSummarySettingsModal}
        onOpenChange={setShowSummarySettingsModal}
      />
    </div>
  );
}
