"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeModal } from "@/components/InputModal";
import { ChatSettingsModal } from "@/components/settings/chatSettings";
import { SummarySettingsModal } from "@/components/settings/summarySettings";
import { Sidebar } from "@/components/sidebar";
import { processTextToParagraphs } from "@/lib/chunk";
import { quickSkimSummary, summarizeParagraphs } from "@/lib/summary+api";
import { handleProcessingError } from "@/lib/functions";
import { startTimer, endTimer, logPerf } from "@/lib/hi";
import { useToast } from "@/hooks/use-toast";
import { useSessionData } from "@/hooks/use-session-data";
import { useFileProcessing } from "@/hooks/use-file-process";
import useSessionStore from "@/store/session-store";
import { useSettingsStore } from "@/store/settings-store";
import { Paragraph, SummaryItem } from "@/types/page";
import { FiSliders, FiDownload } from "react-icons/fi";
import { RightPanel } from "@/components/right-panel";
import {
  exportToMarkdown,
  exportToText,
  exportToPDF,
} from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MainContent } from "@/components/main";
import { documentManager, nextDocumentIndex } from "@/lib/document-refs";
import { HiOutlineMenu } from "react-icons/hi";
import Logo from "@/components/logo";
import {
  clearLocalChatMessages,
  saveLocalSessionContent,
  updateLocalSessionMeta,
} from "@/lib/local-session";

const SAMPLE_LEGAL_TEXT = `SERVICE AGREEMENT

This Service Agreement is entered into between Alpha Advisory LLC and Riverbend Foods Pvt. Ltd. The provider will deliver compliance review services for vendor contracts during a 90 day pilot beginning July 1, 2026.

Riverbend will pay USD 12,000 in three equal monthly installments. Either party may terminate for material breach if the breach is not cured within 10 business days after written notice.

All confidential information exchanged under this agreement must be used only for the pilot. The provider may not disclose Riverbend data to any third party except approved subcontractors who are bound by equivalent confidentiality obligations.

The agreement is governed by the laws of Singapore. Any dispute must first be escalated to senior executives for good-faith negotiation before either party commences arbitration.`;

const SAMPLE_CLAIM_TEXT = `PROPERTY INSURANCE CLAIM PACKET

Insured: Maria Lopez
Property: 418 Cedar Ridge Lane, Austin, Texas
Carrier: Lone Star Mutual Insurance
Policy: HO-783921-TX
Claim: LS-2026-0418
Date of Loss: April 18, 2026
Reported Date: April 20, 2026

Carrier denial letter dated May 12, 2026:
Lone Star Mutual has completed its inspection of the reported wind and hail damage. Coverage is denied for roof replacement because the observed roof conditions are consistent with long-term wear, deterioration, and improper maintenance. The policy excludes loss caused by wear and tear, marring, deterioration, and latent defect. Interior ceiling staining is also denied because no storm-created opening was observed.

Policy excerpts included in the packet:
Coverage A applies to direct physical loss to the dwelling unless excluded. The insured must give prompt notice, protect the property from further damage, show the damaged property as often as reasonably required, and provide records and documents requested by the company.

Exclusions include wear and tear, marring, deterioration, latent defect, faulty workmanship, and neglect. Suit against the company must be brought within two years and one day after the date of loss.

Contractor estimate dated May 19, 2026:
The contractor identifies missing shingles on the west slope, creased shingles on the rear slope, damaged ridge cap, and water staining in the upstairs hallway. The contractor estimate totals $18,420. The carrier estimate totals $1,280 for minor repairs below the $2,500 deductible.

Open reviewer notes:
Photos show hail marks on soft metals and gutters. No engineer report is included. No moisture readings are included. The carrier letter does not reference the contractor estimate.`;

export default function SessionPage() {
  const { sessionId, activeSession, createNewSession, loadSessionData } =
    useSessionData();
  const { extractionProgress, progressMessage, handleFileAdded } =
    useFileProcessing();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { settings, updateSettings } = useSettingsStore();

  const {
    setActiveSession,
    isLoading,
    setIsLoading,
    isProcessingDocument,
    inputText,
    setInputText,
    attachments,
    removeAttachment,
    setParagraphs,
    paragraphs,
    summaries,
    setSummaries,
    setChatMessages,
    toggleSidebar,
    showChatSettingsModal,
    setShowChatSettingsModal,
    showSummarySettingsModal,
    setShowSummarySettingsModal,
    showWelcomeModal,
    setShowWelcomeModal,
    setQuickSummary,
  } = useSessionStore();

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryProgress, setSummaryProgress] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [activeRightPanel, setActiveRightPanel] = useState<
    "chat" | "citation" | "closed"
  >("closed");
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);
  const isNew = searchParams.get("new") === "true";
  const requestedWorkflow = searchParams.get("workflow");
  const isClaimBrief = settings.summary.workflow === "claim-brief";
  const router = useRouter();

  const handleUseSampleDoc = () => {
    setInputText(isClaimBrief ? SAMPLE_CLAIM_TEXT : SAMPLE_LEGAL_TEXT);
    toast({
      title: "Sample loaded",
      description: isClaimBrief
        ? "Review the sample claim packet, then create the brief."
        : "Review the sample text, then process it when ready.",
    });
  };

  useEffect(() => {
    if (requestedWorkflow !== "claim-brief") return;
    updateSettings({
      summary: {
        workflow: "claim-brief",
        jurisdiction: "us-property-claims",
        style: "detailed",
        tone: "professional",
      },
    });
  }, [requestedWorkflow, updateSettings]);

  useEffect(() => {
    if (initialized || !sessionId) {
      return;
    }
    setInitialized(true);

    if (isNew) {
      createNewSession(sessionId);
      setShowWelcomeModal(true);
    } else {
      loadSessionData(sessionId);
    }
  }, [
    createNewSession,
    initialized,
    isNew,
    loadSessionData,
    sessionId,
    setShowWelcomeModal,
  ]);

  const handleSend = async () => {
    const sendTimer = startTimer("HandleSend");
    if (isProcessingDocument || isLoading) return;
    setIsLoading(true);
    setIsSummarizing(true);
    setSummaryProgress(0);
    try {
      const inputTimer = startTimer("ProcessInputs");
      const inputTextParagraphs = await processAllInputs();
      setInputText("");
      setParagraphCount(inputTextParagraphs.length);
      setShowWelcomeModal(false);
      endTimer(inputTimer);
      logPerf("Input processing completed", {
        paragraphCount: inputTextParagraphs.length,
      });

      const skimParagraphs = inputTextParagraphs.slice(0, 10);

      const quickSkimPromise = (async () => {
        const quickSkimTimer = startTimer("QuickSkim");
        try {
          const skim = await quickSkimSummary(skimParagraphs);
          setQuickSummary(skim);
          return skim;
        } catch (err: any) {
          logPerf("Quick skim error (non-fatal)", { error: err.message });
          return "";
        } finally {
          endTimer(quickSkimTimer);
        }
      })();

      const fullSummaryPromise = (async () => {
        const summarizeTimer = startTimer("Summarization");
        try {
          const result = await summarizeParagraphs(
            inputTextParagraphs,
            (percent, phase, _partial) => {
              setSummaryProgress(percent);
              if (phase) {
                logPerf("Summary progress", { percent, phase });
              }
            }
          );

          setSummaries(result);
          setActiveSession({
            ...activeSession!,
            title: result.title || (isClaimBrief ? "ClaimBrief" : "Legal Session"),
          });
          setParagraphs(inputTextParagraphs);

          const skim = await quickSkimPromise;
          await saveLocalSession(inputTextParagraphs, result, skim);
        } catch (err: any) {
          handleProcessingError("Summarization failed", err);
          toast({
            variant: "destructive",
            title: "Summarization Error",
            description: `${err.message}`,
          });
        } finally {
          setIsSummarizing(false);
          endTimer(summarizeTimer);
        }
      })();

      // --- STEP 3: Let both run independently ---
      await Promise.allSettled([quickSkimPromise, fullSummaryPromise]);
    } catch (err: any) {
      logPerf("HandleSend error", { error: err.message });
      handleProcessingError("Processing failed", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `${err.message}`,
      });
    } finally {
      setIsLoading(false);
      endTimer(sendTimer);
      logPerf("HandleSend completed");
    }
  };

  const processAllInputs = useCallback(async () => {
    // run expensive parsing on next tick to avoid blocking paint
    return await new Promise<Paragraph[]>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const textParagraphs = inputText.trim()
            ? await processTextToParagraphs(
                inputText.trim(),
                nextDocumentIndex.current++
              )
            : [];

          const fileParagraphs = await Promise.all(
            attachments.map((a) =>
              processTextToParagraphs(
                a.text || "",
                documentManager.current[a.id]
              )
            )
          );

          resolve([...textParagraphs, ...fileParagraphs.flat()]);
        } catch (err) {
          // reject instead of throwing to properly surface to the caller
          reject(err);
        }
      }, 0);
    });
  }, [inputText, attachments]);

  const saveLocalSession = useCallback(
    async (
      allParagraphs: Paragraph[],
      result: SummaryItem,
      quickSummary: string
    ) => {
      const sessionId = activeSession?.id;
      if (!sessionId) return;

      try {
        const title =
          result.title ||
          activeSession?.title ||
          (isClaimBrief ? "ClaimBrief" : "Legal Session");
        const updatedAt = Date.now();

        saveLocalSessionContent(sessionId, {
          paragraphs: allParagraphs,
          summaries: result,
          quickSummary,
          title,
        });
        updateLocalSessionMeta(sessionId, {
          title,
          summary: result,
          noOfAttachments: attachments.length,
          updatedAt,
        });
        setActiveSession({
          ...activeSession,
          title,
          summaries: result,
          quickSummary,
          noOfAttachments: attachments.length,
          updatedAt,
        });
      } catch (error) {
        handleProcessingError("Finalize Processing", error);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Failed to save session data",
        });
      }
    },
    [
      activeSession,
      attachments.length,
      isClaimBrief,
      setActiveSession,
      toast,
    ]
  );

  const handleRemoveAttachment = useCallback(
    async (id: string) => {
      removeAttachment(id);
      delete documentManager.current[id];
    },
    [removeAttachment]
  );

  const handleDeleteChats = async () => {
    if (!sessionId) return;
    try {
      clearLocalChatMessages(sessionId);
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

  const handleCitationClick = (id: string) => {
    setCurrentSourceId(id);
    setActiveRightPanel("citation");
  };

  const toggleChat = () => {
    if (activeRightPanel === "chat") {
      setActiveRightPanel("closed");
    } else {
      setActiveRightPanel("chat");
    }
  };

  const closeRightPanel = () => {
    setActiveRightPanel("closed");
  };

  const handleExport = async (format: "pdf" | "markdown" | "text") => {
    if (!summaries || !activeSession?.title) {
      toast({
        title: "Nothing to export",
        description: "Please generate a summary first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportOptions = {
        workflow: isClaimBrief ? "claim-brief" : "legal",
        paragraphs,
      } as const;

      switch (format) {
        case "pdf":
          await exportToPDF(summaries, activeSession.title, exportOptions);
          break;
        case "markdown":
          exportToMarkdown(summaries, activeSession.title, exportOptions);
          break;
        case "text":
          exportToText(summaries, activeSession.title, exportOptions);
          break;
      }
      toast({
        title: "Export successful",
        description: `Downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#edeffa] text-foreground overflow-hidden">
      <div className="flex flex-col items-center bg-[#edeffa] shadow-none select-none p-2 pt-4 md:p-0 md:pt-4 lg:pl-0 lg:pt-4 lg:flex-row lg:items-center lg:ml-4 lg:mb-4 lg:justify-start">
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md"
        >
          <HiOutlineMenu size={24} className="text-gray-600" />
        </button>
        <div className="lg:hidden flex flex-col items-center mt-2 mb-1">
          <Logo />
        </div>

        {/* Session Title */}
        <div className="lg:flex lg:items-center">
          <div className="hidden lg:flex lg:items-center lg:mr-4">
            <Logo />
          </div>
          <motion.h2 className="text-lg font-semibold text-gray-800 text-center lg:text-left line-clamp-2 lg:line-clamp-none lg:truncate max-w-[200px] md:max-w-none mx-2 lg:ml-0">
            {typeof activeSession?.title === "string"
              ? activeSession.title
              : "Untitled"}
          </motion.h2>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-visible flex-col lg:flex-row">
        <Sidebar sessionId={sessionId!} />

        <main className="flex-1 min-w-0 mb-4 overflow-hidden">
          <motion.div className="flex flex-col h-full overflow-hidden border-none lg:rounded-xl bg-white">
            <div className="z-10 border-b flex items-center justify-between py-2">
              <div className="flex items-center justify-between w-full">
                <div className="p-2 ml-10 font-medium">
                  {isClaimBrief ? "Claim Brief and Key Information" : "Briefs and Key Information"}
                </div>
                {(activeSession?.noOfAttachments ?? 0) > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm mx-4"
                  >
                    {activeSession?.noOfAttachments ?? 0}{" "}
                    {activeSession?.noOfAttachments === 1
                      ? "attachment"
                      : "attachments"}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {summaries && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isExporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiDownload size={16} />
                        {isExporting ? "Exporting..." : "Export"}
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleExport("pdf")}
                        className="cursor-pointer"
                      >
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("markdown")}
                        className="cursor-pointer"
                      >
                        Export as Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("text")}
                        className="cursor-pointer"
                      >
                        Export as Text
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSliders
                    size={18}
                    className="m-2 text-gray-600 cursor-pointer hover:text-black"
                    onClick={() => setShowSummarySettingsModal(true)}
                  />
                </motion.div>
              </div>
            </div>

            <div
              ref={summaryRef}
              className="flex-1 p-4 min-h-0 overflow-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              <AnimatePresence mode="wait">
                <MainContent
                  isSummarizing={isSummarizing}
                  paragraphCount={paragraphCount}
                  summaryProgress={summaryProgress}
                  onCitationClick={handleCitationClick}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        <RightPanel
          activeRightPanel={activeRightPanel}
          currentSourceId={currentSourceId}
          sessionId={sessionId!}
          onClose={closeRightPanel}
          onToggleChat={toggleChat}
          onCitationClick={handleCitationClick}
          onDeleteChats={handleDeleteChats}
        />
      </div>

      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeModal
              isOpen={showWelcomeModal}
              onOpenChange={() => {
                router.replace("/");
                setShowWelcomeModal(false);
              }}
              inputText={inputText}
              onInputTextChange={setInputText}
              attachments={attachments}
              onFileAdded={handleFileAdded}
              onRemoveAttachment={handleRemoveAttachment}
              onSend={handleSend}
              isProcessing={isProcessingDocument}
              extractionProgress={extractionProgress}
              progressMessage={progressMessage}
              onUseSampleDoc={handleUseSampleDoc}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChatSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChatSettingsModal
              isOpen={showChatSettingsModal}
              onOpenChange={setShowChatSettingsModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummarySettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SummarySettingsModal
              isOpen={showSummarySettingsModal}
              onOpenChange={setShowSummarySettingsModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
