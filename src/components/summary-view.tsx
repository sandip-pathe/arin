"use client";

import React from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import fuzzysort from "fuzzysort";
import { Card, CardContent } from "./ui/card";
import { Chunk, Ontology, SummaryItem } from "@/types/page";

type Props = {
  chunks: Chunk[];
  summaries: SummaryItem[];
  loading?: boolean;
};

// Improved color mapping
const ONTOLOGY_COLORS: Record<keyof Ontology, string> = {
  definitions:
    "bg-blue-100 border-blue-400 dark:bg-blue-900/40 dark:border-blue-600",
  obligations:
    "bg-green-100 border-green-400 dark:bg-green-900/40 dark:border-green-600",
  rights:
    "bg-yellow-100 border-yellow-400 dark:bg-yellow-900/40 dark:border-yellow-600",
  conditions:
    "bg-purple-100 border-purple-400 dark:bg-purple-900/40 dark:border-purple-600",
  clauses:
    "bg-pink-100 border-pink-400 dark:bg-pink-900/40 dark:border-pink-600",
  dates:
    "bg-indigo-100 border-indigo-400 dark:bg-indigo-900/40 dark:border-indigo-600",
  parties:
    "bg-teal-100 border-teal-400 dark:bg-teal-900/40 dark:border-teal-600",
};

// Gradient background colors for summaries
const SUMMARY_COLORS = [
  "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
  "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
  "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
  "bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20",
];

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
      <div key={chunkId} className="space-y-2">
        {sentences.map((sentence, i) => {
          const { index } = matchSummaryToParagraphs(sentence, chunkParagraphs);

          return (
            <Sheet key={`${chunkId}-${i}`}>
              <SheetTrigger asChild>
                <span className="cursor-pointer hover:underline break-words text-base text-start mr-1">
                  {sentence}
                </span>
              </SheetTrigger>
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
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
                  <li key={i} className="text-lg leading-relaxed">
                    <span
                      className={`inline-block rounded-none px-2 bg-opacity-30 ${
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
