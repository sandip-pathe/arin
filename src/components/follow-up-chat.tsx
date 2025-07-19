"use client";

import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "@/types/page";
import { v4 as uuidv4 } from "uuid";
import { saveChatMessage } from "@/lib/functions";
import { ChatWithOpenAI } from "@/lib/ChatGPT+api";
import { useToast } from "@/hooks/use-toast";

interface ChatWindowProps {
  initialMessages?: ChatMessages[];
  sessionId: string | null;
  context: string;
  setIsChatCollapsed: (val: boolean) => void;
}

export const ChatWindow = ({
  initialMessages,
  sessionId,
  context,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [inputMessageText, setInputMessageText] = useState("");
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessages[]>(
    initialMessages || []
  );
  const { toast } = useToast();

  if (sessionId === null) {
    console.error("Session ID not found.");
    toast({
      title: "Session Error",
      description: "Session ID is required to use the chat feature.",
      variant: "destructive",
    });
    return null;
  }

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleChatSubmit = async () => {
    if (inputMessageText.trim() === "" || isProcessingChat) return;

    const userMessage: ChatMessages = {
      id: uuidv4(),
      role: "user",
      content: inputMessageText,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessageText("");
    setIsProcessingChat(true);
    saveChatMessage(userMessage, sessionId);

    try {
      console.log(`[${context}] Sending message to OpenAI:`, inputMessageText);
      const data = await ChatWithOpenAI(context, inputMessageText);
      const aiMessage: ChatMessages = {
        id: uuidv4(),
        role: "assistant",
        content: data,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      saveChatMessage(aiMessage, sessionId);
    } catch (error) {
      console.error(`[${context}]`, error);

      toast({
        title: `${context} Failed`,
        description:
          error instanceof Error ? error.message : "Unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessingChat(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-none overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-12 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-lg text-gray-400 font-bold select-none">
              Ask questions about your documents!
            </p>
          </div>
        ) : (
          <>
            {[...chatMessages].map((message) => (
              <div
                key={message.id}
                className={`flex p-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-900 text-gray-200 ml-6"
                    : ""
                }`}
              >
                <div className="flex-1 text-sm break-words">
                  <div className="mb-1">{message.content}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {isProcessingChat && (
          <div className="flex items-center p-2">
            <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></span>
            <span className="text-gray-500 text-sm">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatMessages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-lg text-gray-400 font-bold select-none">
            Ask questions about your documents!
          </p>
        </div>
      )}

      <div className="flex items-center justify-between z-10 border-t">
        <div className="bg-white dark:bg-gray-800 w-full rounded-lg flex items-center gap-2 dark:border-gray-700 px-4 py-2 transition-all">
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            value={inputMessageText}
            onChange={(e) => setInputMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button
            size="icon"
            className="rounded-full h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={isProcessingChat || inputMessageText.trim() === ""}
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
