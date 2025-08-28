"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Gavel, Scale, User, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v7 } from "uuid";
import { useToast } from "@/hooks/use-toast";

type TrialRole =
  | "judge"
  | "prosecutor"
  | "defense"
  | "witness"
  | "bailiff"
  | "clerk";

interface TrialParticipant {
  id: string;
  name: string;
  role: TrialRole;
  description: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  sender: TrialParticipant;
  content: string;
  timestamp: Date;
}

interface MockTrialChatProps {
  sessionId: string | null;
  caseTitle?: string;
}

export const MockTrialChat = ({
  sessionId,
  caseTitle = "State v. Anderson, Case No. CR-2023-0456",
}: MockTrialChatProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [inputMessageText, setInputMessageText] = useState("");
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  // Mock trial participants
  const participants: TrialParticipant[] = [
    {
      id: "judge-1",
      name: "Hon. Judith Reynolds",
      role: "judge",
      description: "Presiding judge with 20 years experience",
    },
    {
      id: "prosecutor-1",
      name: "DA Robert Chen",
      role: "prosecutor",
      description: "Lead prosecutor for the state",
    },
    {
      id: "defense-1",
      name: "Atty. Maria Rodriguez",
      role: "defense",
      description: "Public defender representing the accused",
    },
    {
      id: "witness-1",
      name: "Dr. Alan Pritchard",
      role: "witness",
      description: "Forensic expert witness",
    },
    {
      id: "witness-2",
      name: "Officer James Wilson",
      role: "witness",
      description: "Responding police officer",
    },
    {
      id: "bailiff-1",
      name: "Bailiff Thomas",
      role: "bailiff",
      description: "Court officer maintaining order",
    },
    {
      id: "clerk-1",
      name: "Clerk Williams",
      role: "clerk",
      description: "Court clerk recording proceedings",
    },
  ];

  // Get participant by role or id
  const getParticipant = (roleOrId: TrialRole | string) => {
    return (
      participants.find((p) => p.role === roleOrId || p.id === roleOrId) ||
      participants[0]
    );
  };

  const roleIcons = {
    judge: <Gavel className="h-5 w-5" />,
    prosecutor: <Scale className="h-5 w-5" />,
    defense: <Shield className="h-5 w-5" />,
    witness: <User className="h-5 w-5" />,
    bailiff: <User className="h-5 w-5" />,
    clerk: <BookOpen className="h-5 w-5" />,
  };

  const roleColors = {
    judge: "bg-purple-100 border-purple-300 text-purple-900",
    prosecutor: "bg-red-100 border-red-300 text-red-900",
    defense: "bg-blue-100 border-blue-300 text-blue-900",
    witness: "bg-green-100 border-green-300 text-green-900",
    bailiff: "bg-gray-100 border-gray-300 text-gray-900",
    clerk: "bg-yellow-100 border-yellow-300 text-yellow-900",
  };

  useEffect(() => {
    if (sessionId === null) {
      console.error("Session ID not found.");
      toast({
        title: "Session Error",
        description: "Session ID is required to use the conversation feature.",
        variant: "destructive",
      });
      return;
    }

    // Initialize with court opening if no messages
    if (chatMessages.length === 0) {
      const openingMessage: ChatMessage = {
        id: v7(),
        role: "assistant",
        sender: getParticipant("bailiff"),
        content:
          "All rise! The Court of the Honorable Judith Reynolds is now in session.",
        timestamp: new Date(),
      };
      setChatMessages([openingMessage]);
    }

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
    if (inputMessageText.trim() === "" || isProcessingChat) return;

    const userMessage: ChatMessage = {
      id: v7(),
      role: "user",
      sender: getParticipant("defense"),
      content: inputMessageText,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessageText("");
    setIsProcessingChat(true);

    try {
      // Simulate court responses
      setTimeout(() => {
        const responses = generateMockResponses(inputMessageText);
        responses.forEach((response, index) => {
          setTimeout(() => {
            setChatMessages((prev) => [...prev, response]);
            if (index === responses.length - 1) {
              setIsProcessingChat(false);
            }
          }, 1000 * (index + 1));
        });
      }, 1000);
    } catch (error) {
      console.error("Mock trial error", error);
      toast({
        title: "Court Adjourned",
        description: "Unexpected error in proceedings",
        variant: "destructive",
      });
      setIsProcessingChat(false);
    }
  };

  // Generate simulated court responses
  const generateMockResponses = (input: string): ChatMessage[] => {
    const prosecutor = getParticipant("prosecutor");
    const judge = getParticipant("judge");
    const witness =
      Math.random() > 0.5
        ? getParticipant("witness-1")
        : getParticipant("witness-2");

    const responses: ChatMessage[] = [
      {
        id: v7(),
        role: "assistant" as "assistant",
        sender: prosecutor,
        content: `Objection, Your Honor! ${input} is leading the witness.`,
        timestamp: new Date(),
      },
      {
        id: v7(),
        role: "assistant" as "assistant",
        sender: judge,
        content: "Objection sustained. Counsel, rephrase your question.",
        timestamp: new Date(),
      },
      {
        id: v7(),
        role: "assistant" as "assistant",
        sender: witness,
        content: "Based on my expert analysis, the evidence suggests...",
        timestamp: new Date(),
      },
    ];

    return responses;
  };

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Mock Trial Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-3 py-1 flex items-center justify-between">
        <div className="flex items-center">
          <Gavel className="h-6 w-6 mr-2" />
          <div>
            <h2 className="text-lg font-bold">Mock Trial Simulation</h2>
            <p className="text-xs opacity-75">{caseTitle}</p>
          </div>
        </div>
        <div className="text-sm">
          <span className="bg-red-500 px-2 py-1 rounded flex items-center">
            <span className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse"></span>
            LIVE
          </span>
        </div>
      </div>

      {/* Participants Panel */}
      <div className="bg-gray-50 p-3 border-b flex overflow-x-auto space-x-2 scrollbar-hide">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center bg-white px-3 py-2 rounded-lg border shadow-sm min-w-max"
          >
            <div
              className={`p-2 rounded-full mr-2 ${
                roleColors[participant.role]
              }`}
            >
              {roleIcons[participant.role]}
            </div>
            <div>
              <div className="font-medium text-sm">{participant.name}</div>
              <div className="text-xs text-gray-500 capitalize">
                {participant.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 shadow ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : `${roleColors[message.sender.role]} rounded-bl-none`
              }`}
            >
              <div className="flex items-center mb-1">
                {message.role !== "user" && (
                  <div className="mr-2">{roleIcons[message.sender.role]}</div>
                )}
                <div
                  className={`font-semibold ${
                    message.role === "user" ? "text-blue-200" : ""
                  }`}
                >
                  {message.role === "user"
                    ? "You (Defense)"
                    : message.sender.name}
                </div>
              </div>
              <div className="text-sm">{message.content}</div>
              <div
                className={`text-xs mt-2 ${
                  message.role === "user" ? "text-blue-200" : "text-gray-600"
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isProcessingChat && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-xl p-4 rounded-bl-none shadow max-w-[80%]">
              <div className="flex items-center">
                <div className="animate-pulse h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
                <span className="text-sm text-gray-500">
                  Court is responding...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 px-3 py-2 rounded-lg flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">
              Defense Attorney
            </span>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Present your argument or question to the witness..."
              className="w-full bg-gray-100 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputMessageText}
              onChange={(e) => setInputMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <Button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 bg-blue-600 hover:bg-blue-700"
              disabled={isProcessingChat || inputMessageText.trim() === ""}
              onClick={handleChatSubmit}
              size="icon"
            >
              <ArrowUp className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        You're participating as the Defense Attorney. Address the court
        professionally.
      </div>
    </div>
  );
};
