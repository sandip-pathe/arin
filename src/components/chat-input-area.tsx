"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Paperclip,
  Link,
  Camera,
  ArrowUp,
  Settings,
  X,
  Loader2,
  FileText,
  FileImage,
  File,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Attachment } from "@/types/page";

interface ChatInputAreaProps {
  inputText: string;
  onInputTextChange: (text: string) => void;
  attachments: Attachment[];
  onFileAdded: (file: File) => void;
  onRemoveAttachment: (id: string) => void;
  onSend: () => void;
  isProcessing: boolean;
}

export function ChatInputArea({
  inputText,
  onInputTextChange,
  attachments,
  onFileAdded,
  onRemoveAttachment,
  onSend,
  isProcessing,
}: ChatInputAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedResponseType, setSelectedResponseType] = useState("auto");
  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState("indian-law");
  const hasMessages = false;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => onFileAdded(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <File className="h-4 w-4 text-red-500" />;
      case "image":
        return <FileImage className="h-4 w-4 text-green-500" />;
      case "text":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "xlsx":
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: Attachment["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "extracted":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const actionOptions = ["Summarize", "Info Extract", "Visualize"];
  const jurisdictionOptions = [
    { value: "indian-law", label: "Indian Law" },
    { value: "us-law", label: "US Law" },
    { value: "eu-law", label: "EU Law" },
    { value: "trade-law", label: "Trade Law" },
  ];
  const responseTypeOptions = [
    { value: "fast", label: "Fast Answer" },
    { value: "slow", label: "Slow Thinking" },
    { value: "auto", label: "Auto" },
  ];

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.png,.jpg,.jpeg"
        multiple
      />
      <Card
        className={`flex flex-col bg-white max-w-4xl w-full self-center rounded-2xl border-none shadow-none`}
      >
        <CardContent className="flex flex-col flex-1 p-2 md:p-4">
          <div className="flex flex-col flex-1 relative overflow-auto">
            <div className="flex-1 text-lg">
              <Textarea
                autoFocus
                placeholder="Type your message or question here..."
                className={`bg-white border-none overflow-auto max-h-64 h-24 w-full focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-lg placeholder:text-gray-500 focus:outline-none text-lg`}
                value={inputText}
                onChange={(e) => onInputTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
            </div>

            {attachments.length > 0 && (
              <div className="mt-2 border-none pt-2">
                <div className="flex flex-row flex-wrap gap-1 max-h-[120px] overflow-y-auto">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center max-w-[240px] justify-between bg-blue-50 rounded-lg p-2"
                    >
                      <div className="flex items-center">
                        {getFileIcon(attachment.type)}
                        <span className="ml-2 text-sm max-w-[140px] truncate">
                          {attachment.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(attachment.status)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive ml-2"
                          onClick={() => onRemoveAttachment(attachment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-10 w-10 hover:bg-transparent hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                      >
                        <Paperclip />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload File</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-10 w-10 hover:text-primary"
                        disabled={isProcessing}
                      >
                        <Link className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Link</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-10 w-10 hover:text-primary"
                        disabled={isProcessing}
                      >
                        <Camera className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Capture Image</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-10 w-10 hover:text-primary"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isProcessing}
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Customize</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                size="icon"
                className="rounded-full h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={
                  isProcessing ||
                  (inputText.trim() === "" && attachments.length === 0)
                }
                onClick={onSend}
              >
                <ArrowUp className="h-5 w-5 text-white" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Customize Options</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Action Options */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                  Action Options
                </h4>
                <div className="flex flex-wrap gap-2">
                  {actionOptions.map((action) => (
                    <Button
                      key={action}
                      variant={
                        selectedAction === action ? "default" : "outline"
                      }
                      className={
                        selectedAction === action
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                          : ""
                      }
                      onClick={() => setSelectedAction(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Jurisdiction Options */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                  Jurisdiction
                </h4>
                <div className="flex flex-wrap gap-2">
                  {jurisdictionOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        selectedJurisdiction === option.value
                          ? "default"
                          : "outline"
                      }
                      className={
                        selectedJurisdiction === option.value
                          ? "bg-gradient-to-r from-green-500 to-teal-500 text-white border-0"
                          : ""
                      }
                      onClick={() => setSelectedJurisdiction(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Response Type Options */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                  Response Type
                </h4>
                <div className="flex flex-wrap gap-2">
                  {responseTypeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        selectedResponseType === option.value
                          ? "default"
                          : "outline"
                      }
                      className={
                        selectedResponseType === option.value
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                          : ""
                      }
                      onClick={() => setSelectedResponseType(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
