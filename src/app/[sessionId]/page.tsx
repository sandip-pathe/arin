"use client";

import useSessionStore from "@/store/session-store";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa6";
import { ChatWindow } from "@/components/follow-up-chat";
import { Attachment, DocumentChunk, Paragraph, Session } from "@/types/page";
import { extractText } from "@/lib/extraction";
import { chunkDocument } from "@/lib/chunk";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { WelcomeModal } from "@/components/InputModal";
import { useSearchParams } from "next/navigation";
import { msgs } from "@/lib/data";
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
import { handleProcessingError, loadParagraphs } from "@/lib/functions";
import { GoShieldLock } from "react-icons/go";
import { ChatSettingsModal } from "@/components/settings/chatSettings";
import { SummarySettingsModal } from "@/components/settings/summarySettings";
import SummaryDisplay from "@/components/summaryDisplay";
import { useAuthStore } from "@/store/auth-store";
import { Summarize } from "@/lib/ChatGPT+api";
import { produce } from "immer";
import { ProgressStepper } from "@/components/ProgressStepper";

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
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
    setUserInput,
    attachments,
    setAttachments,
    addAttachment,
    updateAttachment,
    removeAttachment,
    chunks,
    setChunks,
    summaries,
    setSummaries,
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

  const isProcessing = currentStep > 0;

  // Derived state for shared session
  const isSharedWithUser = useMemo(() => {
    if (!activeSession || !user) return false;
    return (
      activeSession.owner !== user?.email &&
      activeSession.sharedWith?.includes(user?.email ?? "")
    );
  }, [activeSession, user]);

  // Session initialization
  useEffect(() => {
    if (!user) {
      console.error("User not authenticated");
    }

    if (initialized) return;
    setInitialized(true);

    const isNew = searchParams.get("new") === "true";

    if (sessionId && !isNew) {
      loadSessionData(sessionId);
    } else if (sessionId && isNew) {
      createNewSession(sessionId);
    } else {
      const newId = uuidv4();
      router.replace(`/${newId}?new=true`);
    }
  }, [user, sessionId, searchParams]);

  // Handle modal after routing
  useEffect(() => {
    if (!sessionId) return;
    const isNew = searchParams.get("new") === "true";
    if (isNew) setShowWelcomeModal(true);
  }, [sessionId, searchParams]);

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
        folder: "all",
        isStarred: false,
        noOfAttachments: 0,
        title: "New Session",
      };

      try {
        await setDoc(doc(db, "sessions", id), newSession);
        setActiveSession(newSession);
      } catch (error) {
        handleProcessingError("Create Session", error);
        toast({
          variant: "destructive",
          title: "Error creating session",
          description: "Failed to initialize new session",
        });
      }
    },
    [user, setActiveSession, toast]
  );

  const loadSessionData = useCallback(
    async (id: string) => {
      if (sessionInitialized.current) return;
      sessionInitialized.current = true;

      setLoadingStates({ ...loadingStates, session: true });

      try {
        const sessionRef = doc(db, "sessions", id);
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists()) {
          createNewSession(id);
          return;
        }

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

        if (sessionData.summaries) {
          setSummaries(sessionData.summaries);
          setContext(sessionData.summaries.map((s) => s.summary).join("\n\n"));
        }

        if (sessionData.userInput) setUserInput(sessionData.userInput);

        // Only load paragraphs if user is owner
        if (sessionData.userId === user?.uid) {
          const loadedParagraphs = await loadParagraphs(id);
          setParagraphs(loadedParagraphs);
        }
      } catch (error) {
        handleProcessingError("Load Session Data", error);
        router.push("/");
      } finally {
        setLoadingStates({ ...loadingStates, session: false });
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
    if (isProcessingDocument || isLoading) return;
    setIsLoading(true);

    try {
      const allChunks = await processAllInputs();

      setIsSummarizing(true);
      const results = await Summarize(
        allChunks,
        (chunkResult, index, total) => {
          setSummaries(
            produce(summaries, (draft) => {
              draft[index] = chunkResult;
            })
          );
        }
      );

      // Finalize
      await finalizeProcessing(results, allChunks);
    } catch (err) {
      handleProcessingError("Send Document", err);
    } finally {
      setIsLoading(false);
      setCurrentStep(0);
      setIsSummarizing(false);
    }
  }, [
    isProcessingDocument,
    isLoading,
    inputText,
    attachments,
    chunks,
    summaries,
  ]);

  const processAllInputs = useCallback(async () => {
    const textChunks = inputText.trim()
      ? await processDocument(
          uuidv4(),
          inputText.trim(),
          "Input_Text",
          nextDocumentIndex.current++
        )
      : [];

    const fileChunks = await Promise.all(
      attachments.map((att) =>
        processDocument(
          att.id,
          att.text || "",
          att.name,
          documentManager.current[att.id]
        )
      )
    );

    const allChunks = [...chunks, ...textChunks, ...fileChunks.flat()];
    setChunks(allChunks);
    return allChunks;
  }, [inputText, attachments, chunks]);

  const finalizeProcessing = useCallback(
    async (results: any[], allChunks: DocumentChunk[]) => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      try {
        const sessionRef = doc(db, "sessions", sessionId);
        await updateDoc(sessionRef, {
          summaries: results.map((r) => r.data),
          updatedAt: serverTimestamp(),
          userInput: inputText.trim(),
          noOfAttachments: attachments.length,
          title: activeSession?.title || "New Session",
        });

        // Update UI state
        setInputText("");
        setAttachments([]);
        setShowWelcomeModal(false);

        // Update active session
        setActiveSession(
          produce(activeSession, (draft) => {
            if (draft) {
              draft.summaries = results.map((r) => r.data);
              draft.userInput = inputText.trim();
              draft.noOfAttachments = attachments.length;
            }
          })
        );

        // Update URL to remove new flag
        if (searchParams.get("new") === "true") {
          router.replace(`/${sessionId}`);
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
      inputText,
      attachments,
      activeSession,
      setActiveSession,
      setInputText,
      searchParams,
      router,
    ]
  );

  const handleFileAdded = useCallback(
    async (file: File) => {
      setIsProcessingDocument(true);
      setProgressMessage(`Processing ${file.name}...`);

      const id = uuidv4();
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
        const text = await extractText(file, (progress, message) => {
          setExtractionProgress(progress);
          setProgressMessage(message || `Processing ${file.name}...`);
        });

        updateAttachment(id, { status: "extracted", text });
        return text;
      } catch (error: any) {
        updateAttachment(id, { status: "error", error: error.message });
        throw error;
      } finally {
        setIsProcessingDocument(false);
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

  const processDocument = useCallback(
    async (
      documentId: string,
      text: string,
      documentName: string,
      documentIndex: number
    ): Promise<DocumentChunk[]> => {
      try {
        return chunkDocument(text, {
          maxChunkSize: 8000,
          documentIndex,
        }).map((chunk) => ({
          ...chunk,
          documentId,
          documentName,
        }));
      } catch (error) {
        handleProcessingError("Process Document", error);
        return [];
      }
    },
    []
  );

  const resetSession = useCallback(() => {
    setActiveSession(null);
    setInputText("");
    setAttachments([]);
    setShowWelcomeModal(true);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#edeffa] text-foreground overflow-hidden">
      <div className="flex items-center justify-start bg-[#edeffa] shadow-none select-none">
        <TopNavbar isSidebarOpen={isSidebarOpen} />
        <h2 className="m-1.5 ml-8 font-semibold text-xl text-gray-700">
          {activeSession?.title || "New Session"}
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
              <div className="flex items-center justify-start">
                <div className="p-2 font-medium">Summary</div>
                {(activeSession?.noOfAttachments ?? 0) > 0 && (
                  <span className="h-6 w-6 bg-blue-200 flex items-center justify-center rounded-full text-xs font-semibold mr-2">
                    {activeSession?.noOfAttachments ?? 0}
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
                {loadingStates.summary || isSummarizing || isProcessing ? (
                  <div className="space-y-4">
                    <SkeletonBox className="h-6 w-3/4" />
                    <SkeletonBox className="h-4 w-full" />
                    <SkeletonBox className="h-4 w-5/6" />
                    <SkeletonBox className="h-6 w-1/2 mt-8" />
                    <SkeletonBox className="h-4 w-full" />
                  </div>
                ) : (
                  <SummaryDisplay
                    paragraphs={paragraphs}
                    summaries={summaries}
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
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <SkeletonBox className="h-4 w-3/4" />
                  <SkeletonBox className="h-4 w-1/2" />
                  <SkeletonBox className="h-32 w-full mt-4" />
                  <SkeletonBox className="h-8 w-full mt-4" />
                </div>
              ) : (
                <ChatWindow
                  initialMessages={msgs}
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
        onSend={() => {
          handleSend();
          setShowWelcomeModal(false);
        }}
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
