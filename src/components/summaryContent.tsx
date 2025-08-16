// SummaryContent.tsx (optimized)
import React, { useState } from "react";
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
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  console.log(`paragraphs`, paragraphs);
  console.log(`summaries`, summaries);
  // Single-pass data preparation
  const { refMap, paraMap } = React.useMemo(() => {
    const refMap = new Map<string, number>();
    const paraMap = new Map<string, Paragraph>();

    // Single loop to create both mappings
    paragraphs.forEach((para, index) => {
      refMap.set(para.id, index + 1);
      paraMap.set(para.id, para);
    });

    return { refMap, paraMap };
  }, [paragraphs]);

  // Directly render citations without additional mappings
  const handleCitationClick = (id: string) => {
    setCurrentSourceId(id);
    setSheetOpen(true);
  };

  return (
    <>
      <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
        <CardContent className="p-4">
          <div className="prose max-w-none">
            {summaries.map((summaryItem, idx) => (
              <div key={idx} className="mb-6">
                {summaryItem.summary.map((part, partIndex) => {
                  // Use Set for O(1) lookups
                  const uniqueSources = new Set(part.sourceParagraphs);

                  return (
                    <div key={partIndex} className="mb-4">
                      <p className="mb-2 text-red-500">{part.text}</p>
                      <div className="flex flex-wrap gap-1">
                        {[...uniqueSources].map((id) => {
                          const refNum = refMap.get(id);
                          return refNum ? (
                            <span
                              key={id}
                              className="citation-badge"
                              onClick={() => handleCitationClick(id)}
                            >
                              [{refNum}]
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source Display Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto p-6 sm:max-w-xl">
          {currentSourceId && paraMap.has(currentSourceId) && (
            <div className="prose">
              <h2 className="text-xl font-bold mb-2">
                Reference {refMap.get(currentSourceId)}
              </h2>
              <div className="whitespace-pre-wrap text-sm p-4 bg-gray-50 rounded-lg">
                {formatContent(paraMap.get(currentSourceId)!.text)}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
