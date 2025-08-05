"use client";

import useSessionStore from "@/store/session-store";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { FaLock } from "react-icons/fa6";
import { ChatWindow } from "@/components/follow-up-chat";
import { Attachment, DocumentChunk, Session, SummaryItem } from "@/types/page";
import { extractText } from "@/lib/extraction";
import { chunkDocument } from "@/lib/chunk";
import { processChunks } from "@/lib/ChatGPT+api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { WelcomeModal } from "@/components/InputModal";
import { useSearchParams } from "next/navigation";
import { msgs } from "@/lib/data";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import TopNavbar from "@/components/navbar";
import { FiSliders } from "react-icons/fi";
import { Sidebar } from "@/components/sidebar";
import { AiOutlineRobot } from "react-icons/ai";
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
import { GoShieldLock } from "react-icons/go";
import {
  ChatSettings,
  ChatSettingsModal,
} from "@/components/settings/chatSettings";
import {
  SummarySettings,
  SummarySettingsModal,
} from "@/components/settings/summarySettings";
import SummaryDisplay from "@/components/summaryDisplay";
import { Button } from "@/components/ui/button";

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
  const [sharedWith, setSharedWith] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

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
    showChatSettingsModal,
    setShowChatSettingsModal,
    showSummarySettingsModal,
    setShowSummarySettingsModal,
  } = useSessionStore();

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

      const isOwner = sessionData.owner === user?.email;
      const isSharedWithUser = sessionData.sharedWith?.includes(
        user?.email ?? ""
      );

      setSharedWith(isSharedWithUser);

      if (!isOwner && !isSharedWithUser) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this session.",
          variant: "destructive",
        });
        router.push("/");
        return;
      }
      setActiveSession(sessionData);

      if (sessionData.summaries) {
        setSummaries(sessionData.summaries);
        setContext(sessionData.summaries.map((s) => s.summary).join("\n\n"));
      }

      if (sessionData.userInput) {
        setUserInput(sessionData.userInput);
      }

      if (!isSharedWithUser) {
        const [loadedChunks] = await Promise.all([loadChunks(id)]);
        setChunks(loadedChunks);
      }
    } catch (error) {
      handleProcessingError("Load Session Data", error);
      router.push("/");
    } finally {
      setLoadingStates({ chunks: false, chats: false, session: false });
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
        summary: Array.isArray(result.data.summary)
          ? result.data.summary.map((s: any) => s.text).join("\n\n")
          : result.data.summary,
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
      const text = await extractText(file, (progress, message) => {
        setExtractionProgress(progress);
        setProgressMessage(message || "");
      });
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

  return (
    <>
      <div className="flex flex-col h-screen bg-[#edeffa] text-foreground overflow-hidden">
        <div className="flex items-center justify-start bg-[#edeffa] shadow-none select-none">
          <TopNavbar isSidebarOpen={isSidebarOpen} />
          <h2 className="m-1.5 ml-8 font-semibold text-xl text-gray-700">
            {activeSession?.title || "New Session"}
          </h2>
          {sharedWith && (
            <div className="flex items-center ml-2 px-2 py-1 rounded-lg  bg-white">
              <GoShieldLock className="font-semibold" size={18} />
              <span className="text-sm ml-1 font-semibold">
                Shared with you
              </span>
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
                  {activeSession?.attachments && (
                    <span className="h-6 w-6 bg-blue-200 flex items-center justify-center rounded-full text-xs font-semibold mr-2">
                      {activeSession?.noOfAttachments}
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
                {summaries.length > 0 ? (
                  <div ref={summaryRef} className="p-6">
                    <SummaryDisplay
                      chunks={chunks}
                      summaries={summaries}
                      loading={loadingStates.chunks}
                    />
                  </div>
                ) : (
                  <div className="p-6 items-center flex flex-col justify-center gap-8">
                    <h2 className="text-lg font-semibold text-gray-700">
                      looks like a new session! Let's
                      <span
                        onClick={() => setShowWelcomeModal(true)}
                        className="text-blue-600 cursor-pointer"
                      >
                        {" "}
                        get started
                      </span>
                      .
                    </h2>
                    <Button
                      variant="outline"
                      className="rounded-full px-4 py-2 transition-colors bg-white text-gray-700 hover:bg-blue-600 hover:text-white text-lg"
                      onClick={() => setShowWelcomeModal(true)}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
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
                  <FaLock size={18} className="text-green-600 m-2" />
                  <FiSliders
                    size={18}
                    className="m-2 text-gray-600 cursor-pointer hover:text-black"
                    onClick={() => setShowChatSettingsModal(true)}
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
    </>
  );
}
