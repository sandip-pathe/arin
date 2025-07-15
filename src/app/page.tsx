"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Search, PlusCircle, MessageSquare, X, ArrowUp } from "lucide-react";
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
import { ChatMessage } from "@/components/chat-messages";
import { SummaryDisplay } from "@/components/summary-view";
import { VscThreeBars } from "react-icons/vsc";
import { BiSolidMessageSquareAdd } from "react-icons/bi";
import { FaHistory, FaSearch } from "react-icons/fa";
import { chunks } from "@/lib/data";
import { summaries } from "@/lib/data";
import {
  FaFile,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa6";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const attachment = [
  {
    id: "doc-1",
    name: "Service_Agreement.pdf",
    type: "pdf",
  },
  {
    id: "doc-2",
    name: "Client_ID_Verification.png",
    type: "image",
  },
  {
    id: "doc-3",
    name: "Terms_and_Conditions.txt",
    type: "text",
  },
  {
    id: "doc-4",
    name: "Terms_and_Conditions.docs",
    type: "docs",
  },
  {
    id: "doc-5",
    name: "Terms_and_Conditions.xlsx",
    type: "xlsx",
  },
];

const message = [
  {
    role: "user",
    content:
      "Summarize this contract and extract any obligations, rights, and important clauses.",
  },
];

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Array<{ name: string; type: string }>;
  summaries?: SummaryItem[]; // Changed from summary
  timestamp: Date;
};

export type SummaryItem = {
  summary: string;
  legalOntology: Ontology;
  chunkIds: string;
};

export type Ontology = {
  definitions: string[];
  obligations: string[];
  rights: string[];
  conditions: string[];
  clauses: string[];
  dates: string[];
  parties: string[];
};

export type Attachment = {
  id: string;
  file: File;
  name: string;
  type: string;
  status: "uploading" | "extracted" | "error";
  text?: string;
  error?: string;
};

export type DocumentChunk = {
  id: string;
  content: string;
  sectionTitle?: string;
  tokenEstimate: number;
  documentId: string;
  documentName: string;
};

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chunk, setChunks] = useState<DocumentChunk[]>([]);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const summaryRef = useRef<HTMLDivElement>(null);
  const hasMessages = chatMessages.length > 0;
  const [summarie, setSummaries] = useState<SummaryItem[]>([]);
  const summaryMessage = messages.find(
    (msg) => msg.role === "assistant" && msg.summaries
  );
  const [inputMessageText, setInputMessageText] = useState("");
  const [isProcessing2, setIsProcessing2] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (inputText.trim() === "" || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing2(true);

    try {
      // Construct context from summaries and chunks
      const context = summaries.map((summary) => summary.summary).join("\n\n");

      // Make API call to ChatGPT
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
            ...newMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: "Failed to get response from AI",
      });
    } finally {
      setIsProcessing2(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (summaryMessage && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [summaryMessage]);

  const handleFileAdded = async (file: File) => {
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

      await saveChunksToFirebase(documentChunks);
      setChunks((prev) => [...prev, ...documentChunks]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error chunking document",
        description: `Failed to process ${documentName}: ${error.message}`,
      });
    }
  };

  const saveChunksToFirebase = async (chunks: DocumentChunk[]) => {
    console.log("Saving chunks to Firebase:", chunks);
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
    if ((inputText.trim() === "" && attachments.length === 0) || isProcessing)
      return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      attachments: attachments.map((a) => ({ name: a.name, type: a.type })),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

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

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "New",
        summaries: newSummaries,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsInputCollapsed(true);
    } catch (err) {
      console.error("Error processing documents:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Skeleton className="h-8 w-48 mt-2" />
        </div>
      </div>
    );
  }

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
                isProcessing={isProcessing}
              />
            </>
          ) : (
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

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              {!isChatCollapsed && (
                <div className="lg:w-[30%]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Chat</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsChatCollapsed(true)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X color="black" className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {chatMessages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question about your documents..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                      />
                      <Button
                        size="icon"
                        onClick={handleSubmit}
                        disabled={isProcessing || inputText.trim() === ""}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {hasMessages && <Footer />}

        {!hasMessages && isChatCollapsed && (
          <div
            className="fixed w-64 bg-white self-center bottom-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-white p-2 border-2 border-gray-600 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
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
              disabled={
                isProcessing ||
                (inputText.trim() === "" && attachments.length === 0)
              }
              onClick={() => setIsChatCollapsed(false)}
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
