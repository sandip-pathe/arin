"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Search,
  PlusCircle,
  MessageSquare,
  X,
  FileText,
  FileImage,
  File,
  Loader2,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatHistory } from "@/components/chat-history";
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
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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
  chunkIds: string[];
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
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const summaryMessage = messages.find(
    (msg) => msg.role === "assistant" && msg.summaries
  );

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

      // Process document immediately after extraction
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
      // Chunk the document
      const documentChunks = chunkDocument(text, { maxChunkSize: 4000 }).map(
        (chunk) => ({
          ...chunk,
          documentId,
          documentName,
        })
      );

      // Save chunks to Firebase
      await saveChunksToFirebase(documentChunks);

      // Add to local state
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
      // Remove from Firebase
      const chunksCollection = collection(db, "chunks");
      const q = query(chunksCollection, where("documentId", "==", documentId));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);

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
    // Remove document chunks
    await removeDocumentChunks(id);

    // Remove attachment
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = async () => {
    if ((inputText.trim() === "" && attachments.length === 0) || isProcessing)
      return;

    // Create user message
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
              <ChatHistory />
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
          {/* 🧭 Toggle Button (Desktop Only) */}
          <button
            className="absolute left-2 top-4 z-10 w-10 h-10 hover:bg-muted transition hidden lg:flex items-center justify-center rounded-full"
            onClick={handleToggleSidebar}
          >
            <VscThreeBars size={24} />
          </button>

          <div className="p-4 flex justify-center">
            {isSidebarExpanded && <Logo />}
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="flex items-center justify-start bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-none"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                {isSidebarExpanded && <span>New Chat</span>}
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-start bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-none"
              >
                {isSidebarExpanded ? (
                  <span className="ml-[28px]">Tools library</span>
                ) : (
                  <span className="sr-only">Tools</span>
                )}
              </Button>
            </div>

            {isSidebarExpanded && (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  className="pl-10 bg-gray-100 border-none focus-visible:ring-0"
                />
              </div>
            )}

            <div className="mt-4 flex-1 overflow-y-auto">
              {isSidebarExpanded && (
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Recent Chats
                </h3>
              )}
              <ChatHistory />
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
            <div className="flex-1 flex flex-col lg:flex-row gap-6">
              {/* Summary Area */}
              <div
                className={`${
                  isChatCollapsed ? "w-full" : "lg:w-2/3"
                } transition-all`}
              >
                <Collapsible
                  open={!isInputCollapsed}
                  onOpenChange={setIsInputCollapsed}
                  className="mb-6 border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer">
                      <div>
                        <h3 className="font-medium">Your Input</h3>
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
                          <PlusCircle className="h-5 w-5" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 border-t">
                      {messages[0]?.content && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-1">Question:</p>
                          <p className="text-sm">{messages[0].content}</p>
                        </div>
                      )}

                      {attachments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Documents:</p>
                          <div className="flex flex-wrap gap-2">
                            {attachments.map((attachment, i) => (
                              <div
                                key={i}
                                className="flex items-center bg-blue-50 px-3 py-2 rounded"
                              >
                                <div className="mr-2">
                                  {attachment.type === "pdf" ? (
                                    <FileText className="h-4 w-4 text-red-500" />
                                  ) : attachment.type === "image" ? (
                                    <FileImage className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <File className="h-4 w-4 text-gray-500" />
                                  )}
                                </div>
                                <span className="text-sm max-w-[160px] truncate">
                                  {attachment.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-2"
                                  onClick={() =>
                                    handleRemoveAttachment(attachment.id)
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <Button
                          onClick={handleSend}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Process Documents
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {summaries.length > 0 && (
                  <div ref={summaryRef}>
                    <SummaryDisplay chunks={chunks} summaries={summaries} />
                  </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3">Processing documents...</span>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              {!isChatCollapsed && (
                <div className="lg:w-1/3 border-l lg:pl-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Chat</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsChatCollapsed(true)}
                      className="lg:hidden"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[60vh] lg:max-h-[70vh]">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex gap-2">
                      <Input placeholder="Ask a follow-up question..." />
                      <Button size="icon">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {!hasMessages && <Footer />}

        {!hasMessages && isChatCollapsed && (
          <Button
            className="fixed right-4 bottom-4 rounded-full shadow-lg flex items-center gap-2"
            onClick={() => setIsChatCollapsed(false)}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Open Chat</span>
          </Button>
        )}
      </div>
    </div>
  );
}
