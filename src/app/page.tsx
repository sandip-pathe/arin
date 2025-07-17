"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInputArea } from "@/components/chat-input-area";
import { ChatWelcome } from "@/components/chat-welcome";
import Logo from "@/components/logo";
import Footer from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { extractText } from "@/lib/extraction";
import { chunkDocument } from "@/lib/chunk";
import { processChunks } from "@/lib/ChatGPT+api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SummaryDisplay } from "@/components/summary-view";
import {
  FaFile,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa6";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ChatWindow } from "@/components/follow-up-chat";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import {
  Attachment,
  ChatMessages,
  DocumentChunk,
  MinimalSession,
  Session,
  SummaryItem,
} from "@/types/page";
import { db } from "@/lib/firebase";
import { Sidebar } from "@/components/sidebar";
import {
  loadChatMessages,
  loadChunks,
  saveChatMessage,
  saveChunksToFirestore,
} from "@/lib/functions";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [Msessions, setMSessions] = useState<MinimalSession[]>([]);
  const allowChunksToFirestore = true;
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    chunks: false,
    chats: false,
  });
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [inputMessageText, setInputMessageText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);

  // UI state
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);

  // Refs
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleProcessingError = (context: string, error: unknown) => {
    console.error(`[${context}]`, error);

    toast({
      title: `${context} Failed`,
      description:
        error instanceof Error ? error.message : "Unexpected error occurred",
      variant: "destructive",
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      const sessionId = new URLSearchParams(window.location.search).get(
        "sessionId"
      );
      if (sessionId) {
        loadSessionData(sessionId);
      } else {
        resetSessionState();
      }
      loadSessionHistory();
    }
  }, [user, loading]);

  const loadSessionHistory = async () => {
    if (!user) return;

    // Load from localStorage first

    if (typeof window !== "undefined") {
      const cachedSessions = localStorage.getItem("sessionHistory");
      if (cachedSessions) {
        const parsedSessions: MinimalSession[] = JSON.parse(cachedSessions);
        setMSessions(parsedSessions);
        return;
      }
    }

    try {
      const sessionsRef = collection(db, "sessions");
      const q = query(
        sessionsRef,
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const minimalSessions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Untitled",
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      }));

      setMSessions(minimalSessions);
    } catch (error) {
      handleProcessingError("Load Session History", error);
    }
  };

  const cacheSessionHistory = (sessions: MinimalSession[]) => {
    localStorage.setItem("sessionHistory", JSON.stringify(sessions));
  };

  const createNewSession = async () => {
    if (!user) return;

    const sessionId = uuidv4();
    const newSession: Session = {
      id: sessionId,
      userId: user.uid,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      attachments: [],
      summaries: [],
      title: "New Session",
    };

    try {
      if (newSession.id) {
        router.replace(`/?sessionId=${newSession.id}`);
      }
      await setDoc(doc(db, "sessions", sessionId), newSession);
      setActiveSession(newSession);
      setMSessions((prev) => [
        {
          id: newSession.id,
          title: newSession.title ?? "Untitled",
          updatedAt:
            typeof newSession.updatedAt === "object" &&
            typeof (newSession.updatedAt as any).toMillis === "function"
              ? (newSession.updatedAt as any).toMillis()
              : Date.now(),
        },
        ...prev,
      ]);
      return sessionId;
    } catch (error) {
      handleProcessingError("Create Session", error);
      return null;
    }
  };

  const AddNewSessionButton = async () => {
    resetSessionState();
    await createNewSession();
  };

  const resetSessionState = () => {
    setChatMessages([]);
    setAttachments([]);
    setChunks([]);
    setSummaries([]);
    setInputText("");
    setIsInputCollapsed(false);
  };

  const saveSession = async () => {
    if (!activeSession) return;

    const { chunks, chats, ...rest } = activeSession;
    const sessionData: Omit<Session, "chunks" | "messages"> = {
      ...rest,
      updatedAt: serverTimestamp() as Timestamp,
      attachments: attachments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
      })),
      summaries,
      userInput,
    };

    try {
      await setDoc(doc(db, "sessions", activeSession.id), sessionData);
      toast({
        title: "Session Saved",
        description: "Your session has been saved successfully",
      });

      // Save chunks to Firestore
      if (allowChunksToFirestore) {
        await saveChunksToFirestore(activeSession.id, chunks!).catch(
          (error) => {
            handleProcessingError("saveChunkToFirebase", error);
          }
        );
      }
    } catch (error) {
      handleProcessingError("Save Session", error);
    }
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

    setAttachments((prev) => [...prev, newAttachment]);

    try {
      const text = await extractText(file);
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === newAttachment.id ? { ...a, status: "extracted", text } : a
        )
      );
      processDocument(newAttachment.id, text, file.name);
    } catch (error: any) {
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === newAttachment.id
            ? {
                ...a,
                status: "error",
                error: error.message || "Failed to extract text",
              }
            : a
        )
      );
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: `Failed to extract text from ${newAttachment.name}: ${error.message}`,
      });
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

      setChunks((prev) => {
        const seen = new Set(documentChunks.map((c) => c.id));
        return [...prev.filter((c) => !seen.has(c.id)), ...documentChunks];
      });

      setIsProcessingDocument(false);
      return documentChunks;
    } catch (error) {
      setIsProcessingDocument(false);
      return [];
    }
  };

  const handleSend = async () => {
    if (isProcessingDocument || isLoading) return;

    let targetSession = activeSession?.id;
    if (!targetSession) {
      const sessionId = await createNewSession();
      if (!sessionId) return;
      targetSession = Msessions.find((s) => s.id === sessionId)?.id;
      if (!targetSession) return;
    }

    const inputTextTrimmed = inputText.trim();
    setUserInput(inputTextTrimmed);
    let newChunks: DocumentChunk[] = [];

    if (inputTextTrimmed !== "") {
      newChunks = await processDocument(
        targetSession,
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
      saveSession();
    } catch (err) {
      handleProcessingError("Send Document", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionData = async (sessionId: string) => {
    setLoadingStates({ chunks: true, chats: true });
    try {
      const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
      setActiveSession({
        id: sessionDoc.id,
        ...sessionDoc.data(),
      } as Session);

      await Promise.allSettled([
        loadChunks(sessionId).then((chunks) => {
          setChunks(chunks);
          setLoadingStates((prev) => ({ ...prev, chunks: false }));
        }),
        loadChatMessages(sessionId).then((chats) => {
          setChatMessages(chats);
          setLoadingStates((prev) => ({ ...prev, chats: false }));
        }),
      ]);
    } catch (error) {
      handleProcessingError("Load Session Data", error);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    await loadSessionData(sessionId);
    router.replace(`/?sessionId=${sessionId}`); // Update URL
  };

  const removeDocumentChunks = async (documentId: string) => {
    try {
      setChunks((prev) =>
        prev.filter((chunk) => chunk.documentId !== documentId)
      );
    } catch (error) {
      handleProcessingError("Remove Document Chunks", error);
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    await removeDocumentChunks(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleChatSubmit = async () => {
    if (!activeSession) {
      const sessionId = await createNewSession();
      if (!sessionId) return;
    }

    if (inputMessageText.trim() === "" || isProcessingChat) return;

    const userMessage: ChatMessages = {
      id: uuidv4(),
      role: "user",
      content: inputMessageText,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessageText("");
    if (activeSession) {
      saveChatMessage(userMessage, activeSession.id);
    }
    setIsProcessingChat(true);

    try {
      // Construct context from summaries
      const context = summaries.map((summary) => summary.summary).join("\n\n");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a legal assistant. Use this context to answer questions: ${context}`,
            },
            {
              role: "user",
              content: inputMessageText,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: ChatMessages = {
        id: uuidv4(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      if (activeSession) {
        saveChatMessage(aiMessage, activeSession.id);
      }

      saveSession();
    } catch (error) {
      handleProcessingError("Chat Processing", error);
    } finally {
      setIsProcessingChat(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Skeleton className="h-8 w-48 mt-2 bg-gray-300" />
        </div>
      </div>
    );
  }

  const hasMessages = summaries.length > 0;

  const handleToggleSidebar = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    setIsManuallyExpanded(newState);
  };

  return (
    <div className="flex flex-auto min-h-screen bg-background">
      <Sidebar
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        isSidebarExpanded={isSidebarExpanded}
        isManuallyExpanded={isManuallyExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        handleToggleSidebar={handleToggleSidebar}
        sessions={Msessions}
        activeSessionId={activeSession?.id || null}
        onSelectSession={handleSelectSession}
        onNewSession={AddNewSessionButton}
      />

      {/* 🔵 Main Content */}
      <div className="flex-1 flex flex-col h-svh">
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          {!hasMessages ? (
            <>
              <ChatWelcome />
              <ChatInputArea
                inputText={inputText}
                onInputTextChange={setInputText}
                attachments={attachments}
                onFileAdded={handleFileAdded}
                onRemoveAttachment={handleRemoveAttachment}
                onSend={handleSend}
                isProcessing={isProcessingDocument}
              />
            </>
          ) : hasMessages && !isProcessingDocument ? (
            <div className="flex-1 flex lg:flex-row gap-6">
              <div
                className={`${
                  isChatCollapsed ? "w-full" : "w-[70%]"
                } transition-all items-start`}
              >
                {/* Summaries INPUT Section */}
                <div className="max-w-4xl">
                  <Collapsible
                    open={isInputCollapsed}
                    onOpenChange={setIsInputCollapsed}
                    className="mb-6 border-none rounded-lg overflow-hidden"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex border-none justify-between items-center p-4 pb-0 bg-white cursor-pointer">
                        <div>
                          <h2 className="font-medium text-base">Input</h2>
                          <p className="text-sm text-gray-500">
                            {attachments.length > 0
                              ? `${attachments.length} document${
                                  attachments.length > 1 ? "s" : ""
                                } attached`
                              : "Text input"}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          {isInputCollapsed ? (
                            <FaChevronUp size={18} />
                          ) : (
                            <FaChevronDown size={18} />
                          )}
                        </Button>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 border-t bg-white dark:bg-gray-900">
                        {activeSession?.userInput && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-800 dark:text-gray-100">
                              {activeSession?.userInput}
                            </p>
                          </div>
                        )}

                        {attachments.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-2">
                              {attachments.map((attachment, i) => (
                                <div
                                  key={i}
                                  className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded"
                                >
                                  <div className="mr-2">
                                    {attachment.type === "pdf" ? (
                                      <FaFilePdf className="h-4 w-4 text-red-500" />
                                    ) : attachment.type === "docs" ? (
                                      <FaFileWord className="h-4 w-4 text-blue-500" />
                                    ) : attachment.type === "image" ? (
                                      <FaFileImage className="h-4 w-4 text-purple-500" />
                                    ) : attachment.type === "xlsx" ? (
                                      <FaFileExcel className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <FaFile className="h-4 w-4 text-gray-500" />
                                    )}
                                  </div>
                                  <span className="text-sm max-w-[160px] truncate">
                                    {attachment.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {summaries.length > 0 && (
                  <div ref={summaryRef}>
                    <SummaryDisplay
                      chunks={chunks}
                      summaries={summaries}
                      loading={loadingStates.chunks}
                    />
                  </div>
                )}
              </div>

              {/* Chat Area*/}
              {!isChatCollapsed && (
                <ChatWindow
                  chatMessages={chatMessages}
                  inputText={inputMessageText}
                  isProcessing={isProcessingChat}
                  handleSubmit={handleChatSubmit}
                  setInputText={setInputMessageText}
                  setIsChatCollapsed={setIsChatCollapsed}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </main>

        {!hasMessages && <Footer />}

        {hasMessages && isChatCollapsed && (
          <div
            className="fixed w-64 bg-white right-4 bottom-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-white p-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
            onClick={() => setIsChatCollapsed(false)}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              className="flex-1 placeholder:text-lg ml-2 border-none focus:ring-0 text-sm z-10"
              onFocus={() => setIsChatCollapsed(false)}
            />
            <Button
              size="icon"
              className="rounded-full h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={isProcessingDocument || isProcessingChat}
            >
              <ArrowUp className="h-5 w-5 text-white" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
