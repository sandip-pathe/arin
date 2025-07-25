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
import { summaries, chunks, attachment, msgs } from "@/lib/data";
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
} from "firebase/firestore";
import {
  handleProcessingError,
  loadChatMessages,
  loadChunks,
} from "@/lib/functions";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
  );
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;

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
    isLoading,
    setIsLoading,
    isProcessingDocument,
    setIsProcessingDocument,
    loadingStates,
    setLoadingStates,
    inputText,
    setInputText,
    setUserInput,
    // attachment,
    setAttachments,
    addAttachment,
    updateAttachment,
    removeAttachment,
    // chunk,
    setChunks,
    // summarie,
    setSummaries,
    setIsInputCollapsed,
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
    if (searchParams.get("new") === "true") {
      setShowWelcomeModal(true);
    }
  }, [searchParams, setShowWelcomeModal]);

  useEffect(() => {
    if (user && !loading && sessionId) {
      loadSessionData(sessionId);
    }
  }, [user, loading, sessionId]);

  const loadSessionData = async (id: string) => {
    resetSessionState();
    setLoadingStates({ chunks: true, chats: true, session: true });

    try {
      // Create new session if doesn't exist
      const sessionRef = doc(db, "sessions", id);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        const newSession: Session = {
          id,
          userId: user!.uid,
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          attachments: [],
          summaries: [],
          title: "New Session",
          createdBy: user!.email || "Unknown",
          owner: user!.email || "Unknown",
          sharedWith: [],
          isStarred: false,
          noOfAttachments: 0,
          userInput: "",
          folder: "default",
        };
        await setDoc(sessionRef, newSession);
      } else {
        const sessionData = sessionDoc.data() as Session;

        // Load summaries
        if (sessionData.summaries) {
          setSummaries(sessionData.summaries);
          setContext(sessionData.summaries.map((s) => s.summary).join("\n\n"));
        }

        // Load user input
        if (sessionData.userInput) {
          setUserInput(sessionData.userInput);
        }
      }

      // Load chunks and messages
      const [loadedChunks] = await Promise.all([loadChunks(id)]);

      setChunks(loadedChunks);
      setLoadingStates({ chunks: false, chats: false, session: false });
    } catch (error) {
      handleProcessingError("Load Session Data", error);
      router.push("/");
    } finally {
      setLoadingStates({ chunks: false, chats: false, session: false });
    }
  };

  const resetSessionState = () => {
    setAttachments([]);
    setChunks([]);
    setSummaries([]);
    setInputText("");
    setIsInputCollapsed(false);
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
    if (isProcessingDocument || isLoading || !activeSession) return;

    const inputTextTrimmed = inputText.trim();
    setUserInput(inputTextTrimmed);
    let newChunks: DocumentChunk[] = [];

    if (inputTextTrimmed !== "") {
      newChunks = await processDocument(
        activeSession.id,
        inputTextTrimmed,
        "Input Text"
      );
    }

    const allChunks = [...chunks, ...newChunks];

    setIsLoading(true);

    try {
      const results = await processChunks(allChunks);
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

      setSummaries(newSummaries);
      setIsInputCollapsed(true);
      setInputText("");
      setContext(newSummaries.map((summary) => summary.summary).join("\n\n"));
      // saveSession();
    } catch (err) {
      handleProcessingError("Send Document", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    removeAttachment(id);
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
        <TopNavbar isSidebarOpen={isSidebarOpen} />
        <div className="flex flex-1 min-h-0 overflow-visible">
          <Sidebar sessionId={sessionId!} />
          {/* Main Content */}
          <main className="flex-1 min-w-0 mb-4 overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden border-none rounded-xl bg-white">
              <div className="z-10 border-b flex items-center justify-between py-2">
                <h2 className="m-1.5 ml-8 font-bold text-xl">
                  {activeSession?.title || "New Session"}
                </h2>
                <p className="mr-8">{attachment.length} attachments</p>
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
          attachments={attachment}
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
