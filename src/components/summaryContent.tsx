// SummaryContent.tsx
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { SummaryItem, Paragraph } from "@/types/page";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatContent } from "@/lib/content-formatting";

type SummaryContentProps = {
  summaries: SummaryItem[];
  paragraphs: Paragraph[];
};

export default function SummaryContent({
  summaries,
  paragraphs,
}: SummaryContentProps) {
  const [currentParagraph, setCurrentParagraph] = useState<Paragraph | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  // Create a mapping from paragraph ID to reference number
  const paragraphRefMap = useMemo(() => {
    const map = new Map<string, number>();
    paragraphs.forEach((para, index) => {
      map.set(para.id, index + 1);
    });
    return map;
  }, [paragraphs]);

  // Create a mapping from paragraph ID to paragraph object
  const paragraphMap = useMemo(() => {
    const map = new Map<string, Paragraph>();
    paragraphs.forEach((para) => map.set(para.id, para));
    return map;
  }, [paragraphs]);

  const renderSummaryWithCitations = (summaryItem: SummaryItem) => {
    return summaryItem.summary.map((part, partIndex) => {
      // Get unique reference numbers for this summary part
      const refNumbers = Array.from(new Set(part.sourceParagraphs))
        .map((id) => ({ id, refNum: paragraphRefMap.get(id) }))
        .filter((item) => item.refNum !== undefined) as {
        id: string;
        refNum: number;
      }[];

      return (
        <div key={partIndex} className="mb-4">
          <p className="mb-2">{part.text}</p>
          <div className="flex flex-wrap gap-1">
            {refNumbers.map(({ id, refNum }, idx) => (
              <span
                key={`${partIndex}-${id}`}
                className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs"
                onClick={() => {
                  const para = paragraphMap.get(id);
                  if (para) {
                    setCurrentParagraph(para);
                    setSheetOpen(true);
                  }
                }}
              >
                [{refNum}]
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
        <CardHeader className="px-4 pt-4">
          <h2 className="text-lg font-semibold sr-only">Summaries</h2>
        </CardHeader>
        <CardContent className="p-4">
          <div className="prose max-w-none dark:prose-invert">
            <div className="text-start text-gray-900 dark:text-gray-100 leading-relaxed break-words">
              {summaries.map((summaryItem, idx) => (
                <div key={idx} className="mb-6">
                  {renderSummaryWithCitations(summaryItem)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheet to show paragraph details */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto p-6 sm:max-w-xl">
          {currentParagraph && (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-bold mb-2">
                Reference {paragraphRefMap.get(currentParagraph.id)}
              </h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-gray-50 rounded-lg">
                <p>{formatContent(currentParagraph.text)}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
