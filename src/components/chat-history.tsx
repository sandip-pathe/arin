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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { useResponsiveLayout } from "@/hooks/responsiveLayout";

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

export function Home() {
  const { isMobile, isMedium, isLarge } = useResponsiveLayout();
  const [windowWidth, setWindowWidth] = useState<number>(0);
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
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const summaryRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const summaryMessage = messages.find(
    (msg) => msg.role === "assistant" && msg.summaries
  );
  const shouldShowChatPanel = hasMessages && !isChatCollapsed;

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
    <div className="flex min-h-screen">
      {/* 🔹 Mobile Sidebar */}
      {isMobile && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="absolute top-4 left-4 z-30">
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
              <div className="pt-4">
                <UserProfile />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* 🖥️ Desktop Sidebar */}
      {!isMobile && (
        <div
          className={`hidden md:flex flex-col h-svh border-r bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-all duration-300 ${
            isSidebarExpanded ? "w-64" : "w-16"
          }`}
          onMouseEnter={() => !isManuallyExpanded && setIsSidebarExpanded(true)}
          onMouseLeave={() =>
            !isManuallyExpanded && setIsSidebarExpanded(false)
          }
        >
          {/* 🔘 Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-[-12px] z-20 hidden lg:flex"
            onClick={handleToggleSidebar}
          >
            {isSidebarExpanded ? <ChevronLeft /> : <ChevronRight />}
          </Button>

          <div className="p-4">{isSidebarExpanded && <Logo />}</div>

          <div className="flex flex-col flex-1 p-4">
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
            {isSidebarExpanded && (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
            )}
            <div className="mt-4 flex-1 overflow-y-auto">
              {isSidebarExpanded && (
                <h3 className="text-muted text-xs mb-2">Recent Chats</h3>
              )}
            </div>
            {isSidebarExpanded && <UserProfile />}
          </div>
        </div>
      )}

      {/* 🔸 Main & Chat Section */}
      <div className="flex-1 flex flex-col h-svh">
        <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-y-auto">
          <div
            className={`transition-all ${
              shouldShowChatPanel && isLarge
                ? isSidebarExpanded
                  ? "lg:w-1/2"
                  : "lg:w-2/3"
                : "w-full"
            }`}
          >
            {!hasMessages ? (
              <>
                {!isMobile && <ChatWelcome />}
                <ChatInputArea
                  inputText={inputText}
                  onInputTextChange={() => {}}
                  attachments={attachments}
                  onFileAdded={() => {}}
                  onRemoveAttachment={() => {}}
                  onSend={() => {}}
                  isProcessing={false}
                />
              </>
            ) : (
              <>
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
                {summaries.length > 0 && (
                  <SummaryDisplay chunks={chunks} summaries={summaries} />
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3">Processing documents...</span>
                  </div>
                )}

                {/* Placeholder for cards when space is available */}
                {isLarge && !shouldShowChatPanel && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {/* Add card components here */}
                    <div className="bg-muted rounded p-4">📌 Card</div>
                    <div className="bg-muted rounded p-4">📌 Card</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 🔹 Chat Panel */}
          {shouldShowChatPanel && (
            <div
              className={`transition-all border-l p-4 bg-background ${
                isLarge
                  ? "lg:w-1/3"
                  : isMedium
                  ? "w-[40%]"
                  : "fixed bottom-0 left-0 right-0 z-20 border-t shadow-lg"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Chat</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatCollapsed(true)}
                >
                  Close
                </Button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} />
                ))}
              </div>
              <div className="pt-4 border-t">
                <ChatInputArea
                  inputText={inputText}
                  onInputTextChange={() => {}}
                  attachments={attachments}
                  onFileAdded={() => {}}
                  onRemoveAttachment={() => {}}
                  onSend={() => {}}
                  isProcessing={false}
                />
              </div>
            </div>
          )}
        </main>

        {!hasMessages && <Footer />}

        {hasMessages && isChatCollapsed && (
          <div
            className="fixed w-64 bg-white blur-sm] self-center bottom-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-white p-2 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
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
