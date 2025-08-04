import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { DocumentChunk, SummaryItem } from "@/types/page";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { getReferenceNumber } from "@/lib/citation-utils";
import { formatContent } from "@/lib/content-formatting";

type SummaryContentProps = {
  summaries: SummaryItem[];
  chunks: DocumentChunk[];
};

export default function SummaryContent({
  summaries,
  chunks,
}: SummaryContentProps) {
  const getChunkById = (id: string) => chunks.find((chunk) => chunk.id === id);

  const renderSummaryWithCitations = (
    summary: string,
    chunkId: string
  ): React.ReactNode => {
    const refNumber = getReferenceNumber(chunks, chunkId);
    const chunk = getChunkById(chunkId);

    return (
      <div key={chunkId} className="space-y-2 max-w-3xl">
        <Sheet>
          <SheetTrigger asChild>
            <span className="cursor-pointer hover:underline break-words text-base text-start mr-1">
              {summary} [{refNumber}]
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
                Reference {refNumber}
              </p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {chunk?.content.split("\n\n").map((para, idx) => (
                  <p key={idx} className="mb-3 last:mb-0">
                    {formatContent(para)}
                  </p>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  };

  return (
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
}
