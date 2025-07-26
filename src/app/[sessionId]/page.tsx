"use client";

import useSessionStore from "@/store/session-store";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SummaryDisplay } from "@/components/summary-view";
import { FaLock } from "react-icons/fa6";
import { ChatWindow } from "@/components/follow-up-chat";
import { Attachment, DocumentChunk, Session, SummaryItem } from "@/types/page";
import { extractText } from "@/lib/extraction";
import { chunkDocument } from "@/lib/chunk";
import { processChunks } from "@/lib/ChatGPT+api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { WelcomeModal } from "@/components/modal";
import { useSearchParams } from "next/navigation";
import { msgs } from "@/lib/data";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import TopNavbar from "@/components/navbar";
import { FiSliders, FiX } from "react-icons/fi";
import { Sidebar } from "@/components/sidebar";
import { motion } from "framer-motion";
import { ChatSettingsModal } from "@/components/sidebar-modals";
import { AiOutlineRobot } from "react-icons/ai";
import { MockTrialChat } from "@/components/mock-trial";
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
  loadChunks,
  saveChunksToFirestore,
} from "@/lib/functions";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
  );
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [modalType, setModalType] = useState<
    "home" | "share" | "settings" | "account" | "mock-trial" | null
  >(null);

  // State management
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
    showWelcomeModal,
    setShowWelcomeModal,
    isSidebarOpen,
    isChatOpen,
    toggleChat,
  } = useSessionStore();

  // Refs
  const summaryRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const isNew = searchParams.get("new") === "true";

    if (user && !loading && sessionId) {
      if (!isNew) {
        loadSessionData(sessionId);
      } else {
        resetSessionState();
        setShowWelcomeModal(true);
      }
    }
  }, [user, loading, sessionId, searchParams]);

  const loadSessionData = async (id: string) => {
    resetSessionState();
    setLoadingStates({ chunks: true, chats: true, session: true });

    try {
      const sessionRef = doc(db, "sessions", id);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        setShowWelcomeModal(true);
        return;
      }

      const sessionData = sessionDoc.data() as Session;
      setActiveSession(sessionData);

      if (sessionData.summaries) {
        setSummaries(sessionData.summaries);
        setContext(sessionData.summaries.map((s) => s.summary).join("\n\n"));
      }

      if (sessionData.userInput) {
        setUserInput(sessionData.userInput);
      }

      setLoadingStates({ chunks: true, chats: true, session: false });

      const [loadedChunks] = await Promise.all([loadChunks(id)]);
      setChunks(loadedChunks);
    } catch (error) {
      handleProcessingError("Load Session Data", error);
      router.push("/");
    } finally {
      setLoadingStates({ chunks: false, chats: false, session: false });
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    removeAttachment(id);
  };

  const resetSessionState = () => {
    setAttachments([]);
    setChunks([]);
    setSummaries([]);
    setInputText("");
  };

  const handleFileAdded = async (file: File) => {
    setIsProcessingDocument(true);
    const newAttachment: Attachment = {
      id: uuidv4(),
      file,
      name: file.name,
      type: file.type.split("/")[0] || file.name.split(".").pop() || "file",
      status: "uploading",
    };

    addAttachment(newAttachment);

    try {
      const text = await extractText(file);
      updateAttachment(newAttachment.id, { status: "extracted", text });
      await processDocument(newAttachment.id, text, file.name);
    } catch (error: any) {
      updateAttachment(newAttachment.id, {
        status: "error",
        error: error.message || "Failed to extract text",
      });
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: `Failed to extract text from ${newAttachment.name}: ${
          error.message || "Unknown error"
        }`,
      });
    } finally {
      setIsProcessingDocument(false);
    }
  };

  const processDocument = async (
    documentId: string,
    text: string,
    documentName: string
  ): Promise<DocumentChunk[]> => {
    try {
      const documentChunks = chunkDocument(text, { maxChunkSize: 4000 }).map(
        (chunk) => ({
          ...chunk,
          documentId,
          documentName,
        })
      );

      setChunks(documentChunks);

      return documentChunks;
    } catch (error) {
      handleProcessingError("Process Document", error);
      return [];
    }
  };

  const handleSend = async () => {
    if (isProcessingDocument || isLoading) return;

    setIsLoading(true);
    const inputTextTrimmed = inputText.trim();
    setUserInput(inputTextTrimmed);
    let newChunks: DocumentChunk[] = [];

    if (inputTextTrimmed !== "") {
      newChunks = await processDocument(
        uuidv4(),
        inputTextTrimmed,
        "Input_Text"
      );
      console.log("Send 1. New chunks:", newChunks);
    }

    const allChunks = [...chunks, ...newChunks];

    try {
      // 1. Create/update session in Firestore
      const sessionData: Partial<Session> = {
        userId: user!.uid,
        updatedAt: serverTimestamp() as Timestamp,
        noOfAttachments: attachments.length,
        userInput: inputTextTrimmed || "",
        title:
          inputTextTrimmed.substring(0, 30) +
            (inputTextTrimmed.length > 30 ? "..." : "") || "New Session",
      };
      console.log("Send 2. Session data:", sessionData);

      if (!activeSession) {
        // New session creation
        sessionData.id = uuidv4();
        sessionData.createdAt = serverTimestamp() as Timestamp;
        sessionData.createdBy = user!.email || "Unknown";
        sessionData.owner = user!.email || "Unknown";
        sessionData.sharedWith = [];
        sessionData.folder = "all";
      }

      const NewSessionId = sessionData.id;

      const sessionRef = doc(
        db,
        "sessions",
        NewSessionId ?? "default-session-id"
      );
      console.log("Send 4. Session reference:", sessionRef);
      // Save or update session data
      await setDoc(sessionRef, sessionData, { merge: true });
      console.log("Send 4. Session saved:", sessionData);

      // 3. Process and get summaries
      router.replace(`/${sessionId}`);
      const results = await processChunks(allChunks);
      console.log("Send 5. Processed results:", results);
      const newSummaries: SummaryItem[] = results.map((result) => ({
        summary: result.data.summary,
        legalOntology: result.data.legalOntology || {
          definitions: [],
          obligations: [],
          rights: [],
          conditions: [],
          clauses: [],
          dates: [],
          parties: [],
        },
        chunkIds: result.chunkId,
      }));

      // 5. Update local state
      setSummaries(newSummaries);
      console.log("Send 6. New summaries:", newSummaries);
      setContext(newSummaries.map((summary) => summary.summary).join("\n\n"));

      setInputText("");
      setShowWelcomeModal(false);

      // 4. Update session with summaries
      await updateDoc(sessionRef, {
        summaries: newSummaries,
        context: newSummaries.map((s) => s.summary).join("\n\n"),
      });

      // 2. Save chunks to subcollection
      await saveChunksToFirestore(sessionId!, allChunks);
    } catch (err) {
      handleProcessingError("Send Document", err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setModalType(null);

  return (
    <>
      {modalType && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-none w-full p-12 max-w-4xl h-[90dvh] shadow-none relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-6 text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-100"
            >
              <FiX size={24} />
            </button>

            <div
              className="overflow-y-auto h-full"
              style={{
                scrollbarWidth: "none",
                scrollbarColor: "#213555 #f3f4f6",
              }}
            >
              {modalType === "settings" && <ChatSettingsModal />}
              {modalType === "mock-trial" && (
                <MockTrialChat sessionId={sessionId!} />
              )}
            </div>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col h-screen bg-[#edeffa] text-foreground overflow-hidden">
        <div className="flex items-center justify-start bg-[#edeffa] shadow-none select-none">
          <TopNavbar isSidebarOpen={isSidebarOpen} />
          <h2 className="m-1.5 ml-8 font-semibold text-xl text-gray-700">
            {activeSession?.title || "New Session"}
          </h2>
        </div>
        <div className="flex flex-1 min-h-0 overflow-visible">
          <Sidebar sessionId={sessionId!} />
          <main className="flex-1 min-w-0 mb-4 overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden border-none rounded-xl bg-white">
              <div className="z-10 border-b flex items-center justify-between py-2">
                <div className="p-2 font-medium">Summary</div>
                <p className="mr-8">
                  {activeSession?.noOfAttachments} attachments
                </p>
              </div>
              <div className="flex-1 min-h-0 overflow-auto scrollbar-thumb-gray-500 scrollbar-track-gray-100 scrollbar-thin">
                <div ref={summaryRef} className="p-6">
                  <SummaryDisplay
                    chunks={chunks}
                    summaries={summaries}
                    loading={loadingStates.chunks}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Chat Panel */}
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
                  <div
                    onClick={() => setModalType("mock-trial")}
                    className="flex flex-col cursor-pointer items-center justify-center m-2 border rounded-sm px-1"
                  >
                    <span className="text-gray-600 text-xs">Mock</span>
                    <span className="text-gray-600 text-sm">Trail</span>
                    {/* <FaGavel className="text-gray-600 cursor-pointer hover:text-black" /> */}
                  </div>
                  <FaLock size={18} className="text-green-600 m-2" />
                  <FiSliders
                    size={18}
                    className="m-2 text-gray-600 cursor-pointer hover:text-black"
                    onClick={() => setModalType("settings")}
                  />
                </div>
              </div>
              <div
                className="flex-1 min-h-0 overflow-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#2563eb #f3f4f6",
                }}
              >
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
                <AiOutlineRobot
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
        />
      </div>
    </>
  );
}
