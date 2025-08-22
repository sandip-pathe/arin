"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Shield, Trash2 } from "lucide-react"; // Added Trash2 icon
import { Button } from "@/components/ui/button";
import { ChatMessages } from "@/types/page";
import { v7 } from "uuid";
import { saveChatMessage, deleteChatMessages } from "@/lib/functions"; // Import delete function
import { useToast } from "@/hooks/use-toast";
import { ChatWithOpenAI } from "@/lib/utils";

interface ChatWindowProps {
  chatMessages?: ChatMessages[];
  setChatMessages: (
    messages: ChatMessages[] | ((prev: ChatMessages[]) => ChatMessages[])
  ) => void;
  sessionId: string | null;
  context: string;
  setIsChatCollapsed: (val: boolean) => void;
}

export const ChatWindow = ({
  chatMessages,
  sessionId,
  context,
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleChatSubmit = async () => {
    if (sessionId === null) {
      console.error("Session ID not found in chat.");
      return null;
    }

    if (inputMessageText.trim() === "" || isProcessingChat) return;

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
      const data = await ChatWithOpenAI(context, inputMessageText);

      const aiMessage: ChatMessages = {
        id: v7(),
        role: "assistant",
        content: data,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...(prev ?? []), aiMessage]);
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

  const handleDeleteChats = async () => {
    if (!sessionId) return;

    try {
      await deleteChatMessages(sessionId);
      setChatMessages([]);
      toast({
        title: "Chats Cleared",
        description: "All chat messages have been deleted.",
      });
    } catch (error) {
      console.error("Error deleting chats:", error);
      toast({
        title: "Error",
        description: "Failed to delete chats.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col h-full border-none overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure Chat</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteChats}
            disabled={!chatMessages || chatMessages.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Chats
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {[...(chatMessages ?? [])].map((message) => (
            <div key={message.id} className="flex rounded-lg">
              <div className="flex-1 text-base break-words">
                <div
                  className={`flex rounded-lg ${
                    message.role === "user"
                      ? `text-blue-900 w-[calc(100%-2rem)] font-semibold text-lg justify-end ${
                          message.content.length < 20 ? "ml-auto" : ""
                        }`
                      : "w-full"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isProcessingChat && (
            <div className="flex items-center p-2">
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></span>
              <span className="text-gray-500 text-sm">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {chatMessages?.length === 0 && (
          <div className="flex items-center justify-center h-full bg-white">
            <p className="text-2xl select-none bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center">
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
    </>
  );
};
