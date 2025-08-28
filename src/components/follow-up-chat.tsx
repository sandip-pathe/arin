"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessages, SummaryItem } from "@/types/page";
import { v7 } from "uuid";
import { saveChatMessage } from "@/lib/functions";
import { useToast } from "@/hooks/use-toast";
import { ChatWithOpenAI } from "@/lib/chat+api";

interface ChatWindowProps {
  chatMessages?: ChatMessages[];
  setChatMessages: (
    messages: ChatMessages[] | ((prev: ChatMessages[]) => ChatMessages[])
  ) => void;
  sessionId: string | null;
  summary: SummaryItem | null;
  setIsChatCollapsed: (val: boolean) => void;
}

export const ChatWindow = ({
  chatMessages,
  sessionId,
  summary,
  setChatMessages,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [inputMessageText, setInputMessageText] = useState("");
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleChatSubmit = async () => {
    if (
      sessionId === null ||
      summary === null || // ✅ guard
      inputMessageText.trim() === "" ||
      isProcessingChat
    ) {
      return;
    }

    const userMessage: ChatMessages = {
      id: v7(),
      role: "user",
      content: inputMessageText,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...(prev ?? []), userMessage]);
    setInputMessageText("");
    setIsProcessingChat(true);
    saveChatMessage(userMessage, sessionId);

    try {
      const data = await ChatWithOpenAI(summary, inputMessageText);

      const aiMessage: ChatMessages = {
        id: v7(),
        role: "assistant",
        content: data,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...(prev ?? []), aiMessage]);
      saveChatMessage(aiMessage, sessionId);
    } catch (error) {
      console.error(`[${summary}]`, error);
      toast({
        title: `${summary} Failed`,
        description:
          error instanceof Error ? error.message : "Unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessingChat(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {[...(chatMessages ?? [])].map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm
                ${
                  message.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isProcessingChat && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></span>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Empty State */}
      {chatMessages?.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-lg select-none text-center">
            Ask questions about your documents!
          </p>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-2">
        <div className="bg-white dark:bg-gray-800 rounded-full flex items-center gap-2 px-4 py-2 shadow-sm hover:shadow-lg">
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            value={inputMessageText}
            onChange={(e) => setInputMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="icon"
            className="rounded-full h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={
              isProcessingChat ||
              inputMessageText.trim() === "" ||
              summary === null
            }
            onClick={handleChatSubmit}
          >
            <ArrowUp className="h-5 w-5 text-white" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
