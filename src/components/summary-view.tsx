"use client";

import React from "react";
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

type Props = {
  chunks: DocumentChunk[];
  summaries: SummaryItem[];
  loading?: boolean;
};

export const SummaryDisplay: React.FC<Props> = ({
  chunks,
  summaries,
  loading,
}) => {
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

  const nonEmptyOntology = Object.entries(mergedOntology)
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
  if (loading) {
    return (
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
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
        <CardHeader className="px-4 pt-4 sr-only">
          <h2 className="text-lg font-semibold">Summaries</h2>
        </CardHeader>
        <CardContent className="p-4">
          <div className="prose max-w-none dark:prose-invert">
            <div className="text-start text-gray-900 dark:text-gray-100 leading-relaxed break-words">
              {summaries.map((summary, idx) => (
                <React.Fragment key={idx}>
                  {renderSummaryWithCitations(
                    summary.summary,
                    summary.chunkIds
                  )}
                  {idx !== summaries.length - 1 && " "}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {nonEmptyOntology.length > 0 && (
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
      )}
    </div>
  );
};
