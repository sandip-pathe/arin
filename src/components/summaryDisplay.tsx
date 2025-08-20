// SummaryDisplay.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paragraph, SummaryItem } from "@/types/page";
import { mergeOntology } from "@/lib/ontology-utils";
import PDFGenerationLoader from "./PDFGenerationLoader";
import SummaryLoading from "./summaryLoading";
import OntologyDisplay from "./ontologyDisplay";
import DownloadSummaryModal from "./downloadSummaryModal";
import { GrDocumentPdf } from "react-icons/gr";
import { usePDFGenerator } from "../hooks/use-pdf-generate";
import SummaryContent from "./summaryContent";

type Props = {
  paragraphs: Paragraph[];
  summary: SummaryItem | null;
  loading?: boolean;
};

export type DownloadOptions = {
  summary: boolean;
  keyData: boolean;
  sources: boolean;
};

export default function SummaryDisplay({
  paragraphs,
  summary,
  loading,
}: Props) {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { generatePDF, isGeneratingPDF } = usePDFGenerator();

  const mergedOntology = useMemo(() => {
    if (!summary) {
      return {
        definitions: [],
        obligations: [],
        rights: [],
        conditions: [],
        clauses: [],
        dates: [],
        parties: [],
      };
    }

    return summary.legalOntology;
  }, [summary]);

  const handleDownload = async (options: DownloadOptions) => {
    setIsDownloadModalOpen(false);
    await generatePDF({
      summaries: summary ? [summary] : [],
      paragraphs,
      ontology: mergedOntology,
      options,
    });
  };

  if (loading) return <SummaryLoading />;
  if (!summary) return <div>No summary available</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <SummaryContent summary={summary} paragraphs={paragraphs} />
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
