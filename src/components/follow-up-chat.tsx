// components/chat-window.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/chat-messages";
import { useToast } from "@/hooks/use-toast";
import { Message, SummaryItem, DocumentChunk } from "@/app/page";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: SummaryItem[];
  initialMessages: Message[];
  onNewMessage: (message: Message) => void;
}

export function ChatWindow({
  isOpen,
  onClose,
  summaries,
  initialMessages,
  onNewMessage,
}: ChatWindowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (inputText.trim() === "" || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    onNewMessage(userMessage);
    setInputText("");
    setIsProcessing(true);

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
      onNewMessage(aiMessage);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: "Failed to get response from AI",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-1/4 max-w-1/4 h-[70vh] flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Legal Assistant</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
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
            onClick={handleSend}
            disabled={isProcessing || inputText.trim() === ""}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
