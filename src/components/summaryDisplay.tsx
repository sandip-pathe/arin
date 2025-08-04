"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentChunk, Ontology, SummaryItem } from "@/types/page";
import { mergeOntology } from "@/lib/ontology-utils";
import { formatContent } from "@/lib/content-formatting";
import { generateIEEECitation } from "@/lib/citation-utils";
import PDFGenerationLoader from "./PDFGenerationLoader";
import PDFGenerator from "./PDFGenerator";
import saveAs from "file-saver";
import SummaryLoading from "./summaryLoading";
import { pdf } from "@react-pdf/renderer";
import SummaryContent from "./summaryContext";
import OntologyDisplay from "./ontologyDisplay";
import DownloadSummaryModal from "./downloadSummaryModal";
import { GrDocumentPdf } from "react-icons/gr";

type Props = {
  chunks: DocumentChunk[];
  summaries: SummaryItem[];
  loading?: boolean;
};

export type DownloadOptions = {
  summary: boolean;
  keyData: boolean;
  sources: boolean;
};

export default function SummaryDisplay({ chunks, summaries, loading }: Props) {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfOptions, setPDFOptions] = useState<DownloadOptions>({
    summary: true,
    keyData: true,
    sources: false,
  });

  const mergedOntology = mergeOntology(summaries);

  const handleDownload = async (options: DownloadOptions) => {
    setPDFOptions(options);
    setIsDownloadModalOpen(false);
    setIsGeneratingPDF(true);

    try {
      // Generate formatted chunks for PDF
      const formattedChunks = chunks.map((chunk) => ({
        ...chunk,
        content: formatContent(chunk.paragraphs.map((p) => p.text).join("\n")),
      }));

      // Generate IEEE citations
      const citations = chunks.reduce((acc, chunk, index) => {
        acc[chunk.id] = generateIEEECitation(chunk, index + 1);
        return acc;
      }, {} as Record<string, string>);

      // Generate PDF as blob
      const pdfBlob = await pdf(
        <PDFGenerator
          summaries={summaries}
          chunks={formattedChunks}
          ontology={mergedOntology}
          options={options}
          citations={citations}
        />
      ).toBlob();

      // Save the file
      saveAs(pdfBlob, "document-summary.pdf");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) return <SummaryLoading />;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsDownloadModalOpen(true)}
          className="bg-red-600 hover:bg-red-500 rounded-full shadow-lg p-3"
          style={{
            minWidth: 0,
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          disabled={isGeneratingPDF}
        >
          <GrDocumentPdf size={28} />
        </Button>
      </div>

      <SummaryContent summaries={summaries} chunks={chunks} />

      <OntologyDisplay ontology={mergedOntology} />

      <DownloadSummaryModal
        open={isDownloadModalOpen}
        onOpenChange={setIsDownloadModalOpen}
        onDownload={handleDownload}
      />

      <PDFGenerationLoader isGeneratingPDF={isGeneratingPDF} />
    </div>
  );
}
