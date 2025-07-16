"use client";

import { useEffect, useRef } from "react";
import { FaXmark } from "react-icons/fa6";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "@/types/page";

interface ChatWindowProps {
  chatMessages: ChatMessages[];
  inputText: string;
  isProcessing: boolean;
  setInputText: (text: string) => void;
  handleSubmit: () => void;
  setIsChatCollapsed: (val: boolean) => void;
}

export const ChatWindow = ({
  chatMessages,
  inputText,
  isProcessing,
  setInputText,
  handleSubmit,
  setIsChatCollapsed,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed lg:w-[28%] bg-background flex flex-col h-[100dvh] right-0 bottom-0 border-none z-50">
      <div className="absolute top-4 right-4 z-20">
        <FaXmark
          size={20}
          className="cursor-pointer text-gray-500 hover:text-gray-700 transition"
          onClick={() => setIsChatCollapsed(true)}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

      <div className="flex-1 overflow-y-auto p-4 pt-12 space-y-4">
        {[...chatMessages].map((message) => (
          <div
            className={`flex p-2 rounded-lg ${
              message.role === "user" ? "bg-blue-900 text-gray-200 ml-6" : ""
            }`}
          >
            <div className="flex-1 text-md break-words">
              <div className="mb-1">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {chatMessages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-lg text-gray-400 font-bold select-none">
            Ask questions about your documents!
          </p>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3">
        <div className="bg-white dark:bg-gray-800 rounded-full flex items-center gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 transition-all">
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button
            size="icon"
            className="rounded-full h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={isProcessing || inputText.trim() === ""}
            onClick={handleSubmit}
          >
            <ArrowUp className="h-5 w-5 text-white" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
