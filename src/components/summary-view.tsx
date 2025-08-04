"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import fuzzysort from "fuzzysort";
import { Card, CardContent, CardHeader } from "./ui/card";
import { DocumentChunk, Ontology, SummaryItem } from "@/types/page";
import { ONTOLOGY_COLORS } from "@/lib/data";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveAs } from "file-saver";

type Props = {
  chunks: DocumentChunk[];
  summaries: SummaryItem[];
  loading?: boolean;
};

type DownloadOptions = {
  summary: boolean;
  keyData: boolean;
  sources: boolean;
};

// PDF Generation Component
const PDFGenerator = ({
  summaries,
  chunks,
  ontology,
  options,
}: {
  summaries: SummaryItem[];
  chunks: DocumentChunk[];
  ontology: Ontology;
  options: DownloadOptions;
}) => {
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 12,
      lineHeight: 1.5,
    },
    title: {
      fontSize: 18,
      marginBottom: 20,
      fontWeight: "bold",
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 16,
      marginTop: 15,
      marginBottom: 10,
      fontWeight: "bold",
      borderBottom: "1px solid #ccc",
      paddingBottom: 5,
    },
    summaryItem: {
      marginBottom: 10,
    },
    citation: {
      fontSize: 10,
      color: "#555",
      marginTop: 5,
    },
    ontologyItem: {
      marginLeft: 10,
      marginBottom: 5,
    },
    ontologyCategory: {
      marginTop: 10,
      fontWeight: "bold",
    },
    sourceItem: {
      marginBottom: 15,
    },
    sourceTitle: {
      fontWeight: "bold",
      marginBottom: 5,
    },
    sourceContent: {
      paddingLeft: 10,
      borderLeft: "2px solid #eee",
      fontSize: 10,
    },
  });

  const getChunkById = (id: string) => chunks.find((chunk) => chunk.id === id);

  const getReferenceNumber = (chunkId: string) => {
    const index = chunks.findIndex((chunk) => chunk.id === chunkId);
    return index !== -1 ? index + 1 : "?";
  };

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Document Summary</Text>

        {options.summary && summaries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Summary</Text>
            {summaries.map((summary, idx) => (
              <View key={idx} style={styles.summaryItem}>
                <Text>{summary.summary}</Text>
                {options.sources && (
                  <Text style={styles.citation}>
                    Source:{" "}
                    {getChunkById(summary.chunkIds)?.documentName || "Unknown"}{" "}
                    [{getReferenceNumber(summary.chunkIds)}]
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {options.keyData && (
          <>
            <Text style={styles.sectionTitle}>Key Data</Text>
            {Object.entries(ontology)
              .filter(([_, values]) => values.length > 0)
              .map(([key, values]) => (
                <View key={key}>
                  <Text style={styles.ontologyCategory}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </Text>
                  {values.map((value, i) => (
                    <Text key={i} style={styles.ontologyItem}>
                      • {value}
                    </Text>
                  ))}
                </View>
              ))}
          </>
        )}

        {options.sources && chunks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Source Documents</Text>
            {chunks.map((chunk, index) => (
              <View key={chunk.id} style={styles.sourceItem} wrap={false}>
                <Text style={styles.sourceTitle}>
                  [{index + 1}] {chunk.documentName || "Untitled Document"}
                </Text>
                <Text style={styles.sourceContent}>{chunk.content}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
};

// Download Options Modal
const DownloadSummaryModal = ({
  open,
  onOpenChange,
  onDownload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (options: DownloadOptions) => void;
}) => {
  const [options, setOptions] = useState<DownloadOptions>({
    summary: true,
    keyData: true,
    sources: false,
  });

  const handleOptionChange = (key: keyof DownloadOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="summary"
              checked={options.summary}
              onCheckedChange={() => handleOptionChange("summary")}
            />
            <Label htmlFor="summary">Summary</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="keyData"
              checked={options.keyData}
              onCheckedChange={() => handleOptionChange("keyData")}
            />
            <Label htmlFor="keyData">Key Data</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sources"
              checked={options.sources}
              onCheckedChange={() => handleOptionChange("sources")}
            />
            <Label htmlFor="sources">Source Documents</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onDownload(options)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Loading State Component
const SummaryLoading = () => (
  <div className="space-y-6 h-full flex flex-col">
    <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
      <CardContent className="p-4">
        <div className="prose max-w-none dark:prose-invert">
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="bg-white rounded-md p-4 max-w-4xl gap-6 grid grid-cols-1 md:grid-cols-2">
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="w-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <ul className="space-y-1 pl-1">
            {[...Array(3)].map((_, i) => (
              <li key={i}>
                <span className="inline-block h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// PDF Generation Loader
const PDFGenerationLoader = ({
  isGeneratingPDF,
}: {
  isGeneratingPDF: boolean;
}) => {
  if (!isGeneratingPDF) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className="text-lg font-semibold mb-4">Generating PDF...</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  );
};

// Ontology Display Component
const OntologyDisplay = ({ ontology }: { ontology: Ontology }) => {
  const nonEmptyOntology = Object.entries(ontology)
    .filter(([_, values]) => values.length > 0)
    .map(([key, values]) => ({
      key: key as keyof Ontology,
      values,
      title: key.charAt(0).toUpperCase() + key.slice(1),
      color: ONTOLOGY_COLORS[key as keyof Ontology],
    }));

  const sortedOntology = [...nonEmptyOntology].sort(
    (a, b) => b.values.length - a.values.length
  );

  if (nonEmptyOntology.length === 0) return null;

  return (
    <div className="bg-white rounded-md p-4 max-w-4xl gap-6 grid grid-cols-1 md:grid-cols-2">
      {sortedOntology.map(({ key, values, title, color }) => (
        <div key={key} className="w-auto">
          <h3
            className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
              key === "definitions"
                ? "text-blue-600"
                : key === "obligations"
                ? "text-green-600"
                : key === "rights"
                ? "text-yellow-600"
                : key === "conditions"
                ? "text-purple-600"
                : key === "clauses"
                ? "text-pink-600"
                : key === "dates"
                ? "text-indigo-600"
                : "text-teal-600"
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-current" />
            {title}
          </h3>
          <ul className="space-y-1 pl-1">
            {values.map((value, i) => (
              <li key={i} className="leading-relaxed">
                <span
                  className={`inline-block text-sm rounded-none px-2 bg-opacity-30 ${
                    key === "definitions"
                      ? "bg-blue-200 dark:bg-blue-800"
                      : key === "obligations"
                      ? "bg-green-200 dark:bg-green-800"
                      : key === "rights"
                      ? "bg-yellow-200 dark:bg-yellow-800"
                      : key === "conditions"
                      ? "bg-purple-200 dark:bg-purple-800"
                      : key === "clauses"
                      ? "bg-pink-200 dark:bg-pink-800"
                      : key === "dates"
                      ? "bg-indigo-200 dark:bg-indigo-800"
                      : "bg-teal-200 dark:bg-teal-800"
                  }`}
                >
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Summary Content Component
const SummaryContent = ({
  summaries,
  chunks,
  renderSummaryWithCitations,
}: {
  summaries: SummaryItem[];
  chunks: DocumentChunk[];
  renderSummaryWithCitations: (
    summary: string,
    chunkId: string
  ) => React.ReactNode;
}) => (
  <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
    <CardHeader className="px-4 pt-4">
      <h2 className="text-lg font-semibold sr-only">Summaries</h2>
    </CardHeader>
    <CardContent className="p-4">
      <div className="prose max-w-none dark:prose-invert">
        <div className="text-start text-gray-900 dark:text-gray-100 leading-relaxed break-words">
          {summaries.map((summary, idx) => (
            <React.Fragment key={idx}>
              {renderSummaryWithCitations(summary.summary, summary.chunkIds)}
              {idx !== summaries.length - 1 && " "}
            </React.Fragment>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Component
export const SummaryDisplay: React.FC<Props> = ({
  chunks,
  summaries,
  loading,
}) => {
  // State management
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfOptions, setPDFOptions] = useState<DownloadOptions>({
    summary: true,
    keyData: true,
    sources: false,
  });

  // Helper functions
  const getChunkById = (id: string) => chunks.find((chunk) => chunk.id === id);

  const getReferenceNumber = (chunkId: string) => {
    const index = chunks.findIndex((chunk) => chunk.id === chunkId);
    return index !== -1 ? index + 1 : "?";
  };

  const splitIntoSentences = (text: string): string[] =>
    text.match(/[^.!?]+[.!?]+[\])'"`’”]*|\s*$/g)?.map((s) => s.trim()) || [];

  const splitIntoParagraphs = (text: string): string[] =>
    text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

  const matchSummaryToParagraphs = (
    sentence: string,
    paragraphs: string[],
    threshold = -100
  ): { bestMatch: string; index: number | null } => {
    const results = fuzzysort.go(sentence, paragraphs);
    const best = results[0];
    if (!best || best.score < threshold) {
      return { bestMatch: "", index: null };
    }
    return { bestMatch: best.target, index: results.indexOf(best) };
  };

  const renderSummaryWithCitations = (
    summary: string,
    chunkId: string
  ): React.ReactNode => {
    const refNumber = getReferenceNumber(chunkId);
    const chunk = getChunkById(chunkId);
    const chunkParagraphs = splitIntoParagraphs(chunk?.content || "");
    const sentences = splitIntoSentences(summary);

    return (
      <div key={chunkId} className="space-y-2 max-w-3xl">
        {sentences.map((sentence, i) => {
          const { index } = matchSummaryToParagraphs(sentence, chunkParagraphs);

          return (
            <Sheet key={`${chunkId}-${i}`}>
              <SheetTrigger asChild>
                <span className="cursor-pointer hover:underline break-words text-base text-start mr-1">
                  {sentence}
                </span>
              </SheetTrigger>
              <SheetTitle className="sr-only">
                {`Reference ${refNumber}.${i + 1} in ${
                  chunk?.documentName ? chunk.documentName : "Unknown Document"
                }`}
              </SheetTitle>
              <SheetContent
                side="right"
                className="overflow-y-auto p-6 sm:max-w-xl"
              >
                <div className="prose dark:prose-invert max-w-none">
                  <h2 className="text-xl font-bold mb-2">
                    {chunk?.documentName || "Unknown Document"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reference {refNumber}.{i + 1}
                  </p>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {chunkParagraphs.map((para, idx) => (
                      <p
                        key={idx}
                        className={
                          idx === index ? "bg-purple-200 px-1 transition" : ""
                        }
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          );
        })}
      </div>
    );
  };

  const mergeOntology = (): Ontology => {
    return summaries.reduce(
      (acc, summary) => {
        Object.keys(summary.legalOntology).forEach((key) => {
          const k = key as keyof Ontology;
          const uniqueValues = [
            ...new Set([...acc[k], ...summary.legalOntology[k]]),
          ];
          acc[k] = uniqueValues;
        });
        return acc;
      },
      {
        definitions: [] as string[],
        obligations: [] as string[],
        rights: [] as string[],
        conditions: [] as string[],
        clauses: [] as string[],
        dates: [] as string[],
        parties: [] as string[],
      } as Ontology
    );
  };

  const mergedOntology = mergeOntology();

  const handleDownload = async (options: DownloadOptions) => {
    setPDFOptions(options);
    setIsDownloadModalOpen(false);
    setIsGeneratingPDF(true);

    // Generate PDF as blob
    const pdfBlob = await pdf(
      <PDFGenerator
        summaries={summaries}
        chunks={chunks}
        ontology={mergedOntology}
        options={options}
      />
    ).toBlob();

    // Save the file
    saveAs(pdfBlob, "document-summary.pdf");

    setIsGeneratingPDF(false);
  };

  if (loading) return <SummaryLoading />;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsDownloadModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Download Summary
        </Button>
      </div>

      <SummaryContent
        summaries={summaries}
        chunks={chunks}
        renderSummaryWithCitations={renderSummaryWithCitations}
      />

      <OntologyDisplay ontology={mergedOntology} />

      <DownloadSummaryModal
        open={isDownloadModalOpen}
        onOpenChange={setIsDownloadModalOpen}
        onDownload={handleDownload}
      />

      <PDFGenerationLoader isGeneratingPDF={isGeneratingPDF} />
    </div>
  );
};
