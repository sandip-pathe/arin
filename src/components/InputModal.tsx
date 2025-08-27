// components/welcome-modal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  ArrowUp,
  Loader2,
  FileText,
  FileImage,
  File,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Attachment } from "@/types/page";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Logo from "./logo";
import { SummarySettings } from "./settings/summarySettings";
import { FiSettings } from "react-icons/fi";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth-store";
import { FaPaperclip } from "react-icons/fa6";

interface WelcomeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inputText: string;
  onInputTextChange: (text: string) => void;
  attachments: Attachment[];
  onFileAdded: (file: File) => void;
  onRemoveAttachment: (id: string) => void;
  onSend: () => void;
  isProcessing: boolean;
  extractionProgress?: number;
  progressMessage?: string;
}

export function WelcomeModal({
  isOpen,
  onOpenChange,
  inputText,
  onInputTextChange,
  attachments,
  onFileAdded,
  onRemoveAttachment,
  onSend,
  isProcessing,
  extractionProgress,
  progressMessage,
}: WelcomeModalProps) {
  const { settings, updateSettings } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [jurisdiction, setJurisdiction] = useState(
    settings.summary.jurisdiction
  );
  const [response, setResponse] = useState(settings.summary.response);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Update local state when settings change from external sources
  useEffect(() => {
    setJurisdiction(settings.summary.jurisdiction);
    setResponse(settings.summary.response);
  }, [settings.summary.jurisdiction, settings.summary.response]);

  // Handle saving settings only when user explicitly changes them
  const handleJurisdictionChange = (value: string) => {
    setJurisdiction(value);
    updateSettings({
      summary: {
        ...settings.summary,
        jurisdiction: value,
      },
    });
  };

  const handleResponseChange = (value: string) => {
    setResponse(value);
    updateSettings({
      summary: {
        ...settings.summary,
        response: value,
      },
    });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 8 * 24;
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      if (inputText.length > 200) {
        textareaRef.current.style.fontSize = "1rem";
      } else if (inputText.length > 100) {
        textareaRef.current.style.fontSize = "1.5rem";
      } else {
        textareaRef.current.style.fontSize = "1.7rem";
      }
    }
  }, [inputText]);

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">
        Welcome to Legal AI Assistant
      </DialogTitle>
      <DialogDescription className="sr-only">
        This is your personal legal assistant powered by AI. You can ask
        questions, upload documents, and get summaries of legal texts.
      </DialogDescription>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none rounded-3xl border-none overflow-hidden">
        <div className="relative bg-white rounded-3xl shadow-lg h-full p-8">
          <Logo />
          <div className="pt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white rounded-xl shadow-none border-dashed border-2 border-gray-200 overflow-hidden">
                <CardContent className="md:p-6 border-none">
                  <div className="flex flex-col border-none">
                    {/* Regular file input for non-mobile or when user wants to select from files */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.png,.jpg,.jpeg"
                      multiple
                      {...(isMobile ? {} : {})}
                    />

                    {/* Text input area */}
                    <div className="relative mb-3">
                      <Textarea
                        ref={textareaRef}
                        autoFocus
                        placeholder="Paste the text here. . ."
                        className={`
                          w-full bg-white border-none focus:ring-0 focus:outline-0 
                          placeholder:text-gray-300 placeholder:text-2xl resize-none p-4 rounded-lg transition-all duration-200
                         focus-visible:ring-transparent focus-visible:ring-offset-0
                        `}
                        value={inputText}
                        onChange={(e) => onInputTextChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                          }
                        }}
                        style={{
                          minHeight: "120px",
                          lineHeight: "1.5",
                          overflowY: "auto",
                          outline: "none",
                        }}
                      />
                      {inputText.length > 0 && (
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 rounded">
                          {inputText.length}
                        </div>
                      )}
                    </div>

                    {/* Attachments */}
                    {attachments.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((attachment) => (
                            <motion.div
                              key={attachment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2 pr-1 border border-blue-200">
                                <div className="flex items-center">
                                  {getFileIcon(attachment.type)}
                                  <span className="ml-2 text-sm max-w-[140px] truncate">
                                    {attachment.name}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="ml-2">
                                    {getStatusIcon(attachment.status)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-500 hover:text-red-500 ml-1"
                                    onClick={() =>
                                      onRemoveAttachment(attachment.id)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {attachment.status === "uploading" &&
                                typeof extractionProgress === "number" &&
                                extractionProgress > 0 &&
                                extractionProgress < 100 && (
                                  <div className="w-full px-2">
                                    <div className="bg-gray-200 rounded-full h-2.5 w-full">
                                      <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                                        style={{
                                          width: `${extractionProgress}%`,
                                        }}
                                      ></div>
                                    </div>
                                    {progressMessage && (
                                      <div className="text-xs mt-1 text-gray-500 text-center">
                                        {progressMessage}
                                      </div>
                                    )}
                                  </div>
                                )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                              >
                                <FaPaperclip size={30} className="h-10 w-10" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Upload File</p>
                            </TooltipContent>
                          </Tooltip>

                          <Sheet
                            open={isSettingsOpen}
                            onOpenChange={setIsSettingsOpen}
                          >
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
                                disabled={isProcessing}
                              >
                                <FiSettings className="h-5 w-5" />
                              </Button>
                            </SheetTrigger>

                            <SheetContent
                              side="right"
                              className="w-full max-w-md sm:max-w-lg"
                            >
                              <SheetHeader>
                                <SheetTitle className="sr-only">
                                  Summary Settings
                                </SheetTitle>
                              </SheetHeader>
                              <SummarySettings />
                            </SheetContent>
                          </Sheet>
                        </TooltipProvider>
                      </div>

                      <Button
                        className={cn(
                          "rounded-full px-6 py-5 bg-blue-600 transition-all",
                          "shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
                          "flex items-center gap-2"
                        )}
                        disabled={
                          isProcessing ||
                          (inputText.trim() === "" && attachments.length === 0)
                        }
                        onClick={onSend}
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-white mr-2" />
                            <span className="font-medium text-lg">
                              {typeof extractionProgress === "number" &&
                              extractionProgress > 0
                                ? `Extracting (${extractionProgress}%)`
                                : "Processing"}
                            </span>
                          </div>
                        ) : (
                          <>
                            <ArrowUp className="h-5 w-5 text-white" size={24} />
                            <span className="font-medium text-lg">Process</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Options */}
            <div className="my-auto mt-4 flex flex-col gap-4 select-none">
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-wrap gap-2">
                  {jurisdictionOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        jurisdiction === option.value ? "default" : "outline"
                      }
                      className={cn(
                        "rounded-full px-4 py-2 transition-colors",
                        jurisdiction === option.value
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                      )}
                      onClick={() => handleJurisdictionChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {responseTypeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        response === option.value ? "default" : "outline"
                      }
                      className={cn(
                        "rounded-full px-4 py-2 transition-colors",
                        response === option.value
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                      )}
                      onClick={() => handleResponseChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
