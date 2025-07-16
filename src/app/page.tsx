"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Search, PlusCircle, MessageSquare, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatInputArea } from "@/components/chat-input-area";
import { ChatWelcome } from "@/components/chat-welcome";
import Logo from "@/components/logo";
import Footer from "@/components/footer";
import { UserProfile } from "@/components/user-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { extractText } from "@/lib/file-utils";
import { chunkDocument } from "@/lib/chunk";
import { processChunks } from "@/lib/ChatGPT+api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SummaryDisplay } from "@/components/summary-view";
import { VscThreeBars } from "react-icons/vsc";
import { BiSolidMessageSquareAdd } from "react-icons/bi";
import { FaHistory, FaSearch } from "react-icons/fa";
import { attachment, chunks, message, msgs } from "@/lib/data";
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
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import {
  Attachment,
  ChatMessages,
  DocumentChunk,
  Message,
  Session,
  SummaryItem,
} from "@/types/page";
import { db } from "@/lib/firebase";
import { summaries } from "@/lib/data";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessages[]>([]);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputMessageText, setInputMessageText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chunk, setChunks] = useState<DocumentChunk[]>([]);
  const [summarie, setSummaries] = useState<SummaryItem[]>([]);

  // UI state
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);

  // Refs
  const summaryRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      loadSessions();
    }
  }, [user, loading]);

  const createNewSession = async () => {
    if (!user) return;

    const sessionId = uuidv4();
    const newSession: Session = {
      id: sessionId,
      userId: user.uid,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      attachments: [],
      messages: [],
      title: "New Session",
    };

    try {
      await setDoc(doc(db, "sessions", sessionId), newSession);
      setActiveSession(newSession);
      setSessions((prev) => [newSession, ...prev]);
      resetSessionState();
      return sessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Failed to create new session",
      });
      return null;
    }
  };

  // Load user sessions
  const loadSessions = async () => {
    if (!user) return;
    // mock data for demonstration purposes
    const mockSessions: Session[] = [
      {
        id: "session-1",
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        attachments: [],
        messages: [],
        title: "Contract Review",
      },
      {
        id: "session-2",
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        attachments: [],
        messages: [],
        title: "Legal Analysis",
      },
    ];

    setSessions(mockSessions);
    if (mockSessions.length > 0) {
      setActiveSession(mockSessions[0]);
    }
  };

  // Reset session state
  const resetSessionState = () => {
    setMessages([]);
    setChatMessages([]);
    setAttachments([]);
    setChunks([]);
    setSummaries([]);
    setInputText("");
    setIsInputCollapsed(false);
  };

  // Save session to Firestore
  const saveSession = async () => {
    if (!activeSession) return;

    const sessionData: Session = {
      ...activeSession,
      updatedAt: serverTimestamp() as Timestamp,
      attachments: attachments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
      })),
      summaries,
      messages: [...messages],
    };

    try {
      await setDoc(doc(db, "sessions", activeSession.id), sessionData);
      toast({
        title: "Session Saved",
        description: "Your session has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save session to database",
      });
    }
  };

  // Save message to Firestore
  const saveMessage = async (message: Message, sessionId: string) => {
    try {
      await addDoc(collection(db, "sessions", sessionId, "messages"), {
        ...message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Save summary to Firestore
  const saveSummary = async (summary: SummaryItem, sessionId: string) => {
    try {
      await addDoc(collection(db, "sessions", sessionId, "summaries"), summary);
    } catch (error) {
      console.error("Error saving summary:", error);
    }
  };

  const handleChatSubmit = async () => {
    if (!activeSession) {
      const sessionId = await createNewSession();
      if (!sessionId) return;
    }

    if (inputMessageText.trim() === "" || isProcessingChat) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: inputMessageText,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    if (activeSession) {
      saveMessage(userMessage, activeSession.id);
    }
    setInputMessageText("");
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

      const aiMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      if (activeSession) {
        saveMessage(aiMessage, activeSession.id);
      }

      // Save the session after chat interaction
      saveSession();
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: "Failed to get response from AI",
      });
    } finally {
      setIsProcessingChat(false);
    }
  };

  const handleFileAdded = async (file: File) => {
    if (!activeSession) {
      const sessionId = await createNewSession();
      if (!sessionId) return;
    }

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
  ) => {
    try {
      const documentChunks = chunkDocument(text, { maxChunkSize: 4000 }).map(
        (chunk) => ({
          ...chunk,
          documentId,
          documentName,
        })
      );

      // Save chunks to Firestore
      if (activeSession) {
        for (const chunk of documentChunks) {
          await addDoc(
            collection(db, "sessions", activeSession.id, "chunks"),
            chunk
          );
        }
      }

      setChunks((prev) => [...prev, ...documentChunks]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error chunking document",
        description: `Failed to process ${documentName}: ${error.message}`,
      });
    }
  };

  const removeDocumentChunks = async (documentId: string) => {
    try {
      setChunks((prev) =>
        prev.filter((chunk) => chunk.documentId !== documentId)
      );
    } catch (error) {
      console.error("Error removing document chunks:", error);
      toast({
        variant: "destructive",
        title: "Error removing document",
        description: "Failed to remove document chunks from storage",
      });
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    await removeDocumentChunks(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = async () => {
    if (!activeSession) {
      const sessionId = await createNewSession();
      if (!sessionId) return;
    }

    if (
      (inputText.trim() === "" && attachments.length === 0) ||
      isProcessingDocument
    )
      return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: inputText,
      attachments: attachments.map((a) => ({ name: a.name, type: a.type })),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (activeSession) {
      saveMessage(userMessage, activeSession.id);
    }
    setInputText("");
    setIsProcessingDocument(true);

    try {
      const results = await processChunks(chunks);
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
        chunkIds: result.data.chunkIds || [],
      }));

      setSummaries(newSummaries);

      // Save summaries to Firestore
      if (activeSession) {
        for (const summary of newSummaries) {
          saveSummary(summary, activeSession.id);
        }
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I've processed your documents. Here's the summary:",
        summaries: newSummaries,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (activeSession) {
        saveMessage(assistantMessage, activeSession.id);
      }
      setIsInputCollapsed(true);

      // Save the session after processing
      saveSession();
    } catch (err) {
      console.error("Error processing documents:", err);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to process documents",
      });
    } finally {
      setIsProcessingDocument(false);
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

  const hasMessages = true;

  const handleToggleSidebar = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    setIsManuallyExpanded(newState);
  };

  return (
    <div className="flex flex-auto min-h-screen bg-background">
      {/* 🟢 Mobile Sidebar (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="absolute top-4 left-4 md:hidden">
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-4 h-[calc(100vh-120px)]">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  setIsSheetOpen(false);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Chat
              </Button>
              <Button variant="outline" className="justify-start">
                Tools library
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-10" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Recent Chats
              </h3>
            </div>
            <div className="border-t pt-4">
              <UserProfile />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 🖥️ Desktop Sidebar (Hover + Toggle) */}
      <div
        className={`hidden md:flex h-svh border-r transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => {
          if (!isManuallyExpanded) setIsSidebarExpanded(true);
        }}
        onMouseLeave={() => {
          if (!isManuallyExpanded) setIsSidebarExpanded(false);
        }}
      >
        <div className="flex flex-col w-full relative">
          <button
            className="z-10 w-10 h-10 hover:bg-muted transition hidden lg:flex items-center justify-center rounded-full"
            onClick={handleToggleSidebar}
          >
            <VscThreeBars size={24} />
          </button>

          <div className="p-4 flex justify-center">
            {isSidebarExpanded && <Logo />}
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto p-4 mt-4">
            <div className="flex flex-col gap-4">
              <button className="flex items-center justify-start transition lg:flex bg-transparent border-none">
                <BiSolidMessageSquareAdd size={24} />
                {isSidebarExpanded && (
                  <span className="pl-2 text-lg">New Chat</span>
                )}
              </button>
              <button className="flex items-center justify-start transition lg:flex bg-transparent border-none">
                {!isSidebarExpanded && <FaSearch size={24} />}
                {isSidebarExpanded && (
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search chats..."
                      className="pl-10 bg-gray-100 border-none focus-visible:ring-0"
                    />
                  </div>
                )}
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto">
              {!isSidebarExpanded && <FaHistory size={24} />}
              {isSidebarExpanded && (
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Recent Chats
                </h3>
              )}
            </div>

            {isSidebarExpanded && (
              <div className="border-t pt-4 mt-auto">
                <UserProfile />
              </div>
            )}
          </div>
        </div>
      </div>

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
                            {attachment.length > 0
                              ? `${attachment.length} document${
                                  attachment.length > 1 ? "s" : ""
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
                        {message[0]?.content && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-800 dark:text-gray-100">
                              {message[0].content}
                            </p>
                          </div>
                        )}

                        {attachment.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-2">
                              {attachment.map((attachment, i) => (
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
                    <SummaryDisplay chunks={chunks} summaries={summaries} />
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
            className="fixed w-64 bg-white self-center bottom-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-white p-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
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
