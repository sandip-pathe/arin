"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ontology } from "@/app/page";
import { Pin } from "lucide-react";

type Chunk = {
  id: string;
  content: string;
  documentId: string;
  documentName: string;
};

type SummaryItem = {
  summary: string;
  legalOntology: Ontology;
  chunkIds: string[];
};

type Props = {
  chunks: Chunk[];
  summaries: SummaryItem[];
};

export const SummaryDisplay: React.FC<Props> = ({ chunks, summaries }) => {
  const getChunkById = (id: string) => {
    return chunks.find((chunk) => chunk.id === id);
  };

  const renderSummaryWithReferences = (text: string, chunkIds: string[]) => {
    return text.split("\n").map((para, idx) => {
      const parts = [];
      let lastIndex = 0;
      const regex = /\{\{(\d+)\}\}/g;
      let match;
      let keyCount = 0;

      while ((match = regex.exec(para)) !== null) {
        const index = parseInt(match[1]);
        // Add text before the reference
        if (match.index > lastIndex) {
          parts.push(
            <React.Fragment key={`text-${idx}-${keyCount++}`}>
              {para.slice(lastIndex, match.index)}
            </React.Fragment>
          );
        }

        // Add the reference popover
        const chunkId = chunkIds[index];
        const chunk = getChunkById(chunkId);
        if (chunk) {
          parts.push(
            <span
              key={`ref-${idx}-${index}`}
              className="inline-flex items-center"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <sup className="text-blue-500 cursor-pointer hover:underline mx-0.5">
                    [{index + 1}]
                  </sup>
                </PopoverTrigger>
                <PopoverContent className="max-w-xl text-sm whitespace-pre-wrap">
                  <div className="font-medium mb-1">
                    Reference to chunk {index + 1}:
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {chunk.documentName}
                  </div>
                  {chunk.content}
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                    <Pin className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-xl">
                  <div className="font-medium mb-2">Pin this reference</div>
                  <p className="text-sm text-muted-foreground">
                    This reference will be saved to your research board
                  </p>
                </PopoverContent>
              </Popover>
            </span>
          );
        }
        lastIndex = match.index + match[0].length;
      }

      // Add any remaining text after the last reference
      if (lastIndex < para.length) {
        parts.push(
          <React.Fragment key={`text-end-${idx}`}>
            {para.slice(lastIndex)}
          </React.Fragment>
        );
      }

      return (
        <p
          key={idx}
          className="text-base text-gray-800 dark:text-gray-200 mb-4 leading-relaxed"
        >
          {parts}
        </p>
      );
    });
  };

  const mergeOntology = (): Ontology => {
    return summaries.reduce(
      (acc, summary) => {
        Object.keys(summary.legalOntology).forEach((key) => {
          const k = key as keyof Ontology;
          acc[k] = [...acc[k], ...summary.legalOntology[k]];
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

  // Filter out empty ontology categories
  const nonEmptyOntology = Object.entries(mergedOntology)
    .filter(([_, values]) => values.length > 0)
    .map(([key, values]) => ({
      key: key as keyof Ontology,
      values,
      title: key.charAt(0).toUpperCase() + key.slice(1),
    }));

  return (
    <div className="space-y-6">
      {/* Combined Summary Card */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📄 Document Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            {summaries.map((summary, idx) => (
              <React.Fragment key={idx}>
                {renderSummaryWithReferences(summary.summary, summary.chunkIds)}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Points Grid */}
      {nonEmptyOntology.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nonEmptyOntology.map(({ key, values, title }) => (
            <Card key={key} className="bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {values.map((value, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="text-sm">{value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* References Card */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>📚 Document References</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {chunks.map((chunk, i) => (
              <div
                key={chunk.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border"
              >
                <div className="flex items-center">
                  <div className="bg-gray-100 dark:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{chunk.documentName}</div>
                    <div className="text-xs text-muted-foreground">
                      Section: {chunk.documentName || "General"}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Pin className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
