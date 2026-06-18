// SummaryDisplay.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Paragraph, SummaryItem } from "@/types/page";
import OntologyDisplay from "./ontologyDisplay";
import SummaryContent from "./summaryContent";
import { Button } from "@/components/ui/button";
import { exportToMarkdown, exportToPDF, exportToText } from "@/lib/export-utils";
import { FiDownload } from "react-icons/fi";

type Props = {
  paragraphs?: Paragraph[];
  summary: SummaryItem | null;
  onCitationClick?: (sourceId: string) => void;
};

export type DownloadOptions = {
  summary: boolean;
  keyData: boolean;
  sources: boolean;
};

export default function SummaryDisplay({
  paragraphs,
  summary,
  onCitationClick,
}: Props) {
  const [exportingFormat, setExportingFormat] = useState<
    "pdf" | "markdown" | "text" | null
  >(null);

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
        proceduralPosture: [],
        courtAndJudges: [],
        conflicts: [],
        implications: [],
        citationsAndPrecedents: [],
      };
    }

    return summary.legalOntology;
  }, [summary]);

  const handleExport = async (format: "pdf" | "markdown" | "text") => {
    if (!summary) return;

    const title = summary.title || "Anaya Summary";
    setExportingFormat(format);
    try {
      if (format === "pdf") {
        await exportToPDF(summary, title);
      } else if (format === "markdown") {
        exportToMarkdown(summary, title);
      } else {
        exportToText(summary, title);
      }
    } finally {
      setExportingFormat(null);
    }
  };

  if (!summary) return;

  return (
    <div className="h-full flex items-center flex-col gap-3">
      <div className="flex w-full max-w-4xl items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("pdf")}
          disabled={exportingFormat !== null}
        >
          <FiDownload className="mr-2 h-4 w-4" />
          {exportingFormat === "pdf" ? "Exporting" : "PDF"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("markdown")}
          disabled={exportingFormat !== null}
        >
          MD
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("text")}
          disabled={exportingFormat !== null}
        >
          TXT
        </Button>
      </div>
      <SummaryContent
        onCitationClick={onCitationClick ?? (() => {})}
        summary={summary}
        paragraphs={paragraphs}
      />
      <OntologyDisplay ontology={mergedOntology} />
    </div>
  );
}
