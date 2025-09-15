import { useState, useCallback } from "react";
import { v7 } from "uuid";
import { extractText } from "@/lib/extraction";
import { startTimer, endTimer, logPerf } from "@/lib/hi";
import { Attachment } from "@/types/page";
import useSessionStore from "@/store/session-store";
import { documentManager, nextDocumentIndex } from "@/lib/document-refs";

export const useFileProcessing = () => {
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const { addAttachment, updateAttachment, setIsProcessingDocument } =
    useSessionStore();

  const handleFileAdded = useCallback(
    async (file: File) => {
      const fileTimer = startTimer(`ProcessFile-${file.name}`);
      logPerf("Starting file processing", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      setIsProcessingDocument(true);
      setProgressMessage(`Processing ${file.name}...`);

      const id = v7();

      // ✅ assign index once per new file
      if (!documentManager.current[id]) {
        documentManager.current[id] = nextDocumentIndex.current++;
      }

      const newAttachment: Attachment = {
        id,
        file,
        name: file.name,
        type: file.type.split("/")[0] || "document",
        status: "uploading",
      };

      addAttachment(newAttachment);

      try {
        const extractTimer = startTimer(`TextExtraction-${file.name}`);
        const text = await extractText(file, (progress, message) => {
          setExtractionProgress(progress);
          setProgressMessage(message || `Processing ${file.name}...`);
        });
        endTimer(extractTimer);

        updateAttachment(id, { status: "extracted", text });
        return text;
      } catch (error: any) {
        updateAttachment(id, { status: "error", error: error.message });
        throw error;
      } finally {
        setIsProcessingDocument(false);
        endTimer(fileTimer);
      }
    },
    [addAttachment, updateAttachment, setIsProcessingDocument]
  );

  return {
    extractionProgress,
    progressMessage,
    handleFileAdded,
    setExtractionProgress,
    setProgressMessage,
  };
};
