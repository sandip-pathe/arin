// SummaryContent.tsx (inline prose with periodic paragraph breaks)
import React from "react";
import { Card, CardContent } from "./ui/card";
import { SummaryItem, Paragraph } from "@/types/page";

type SummaryContentProps = {
  summary: SummaryItem;
  paragraphs?: Paragraph[];
  onCitationClick: (sourceId: string) => void;
};

export default function SummaryContent({
  summary,
  paragraphs,
  onCitationClick,
}: SummaryContentProps) {
  // Build citation map only if paragraphs are available
  const refMap = React.useMemo(() => {
    if (!paragraphs || paragraphs.length === 0) return null;

    const map = new Map<string, number>();
    paragraphs.forEach((para, index) => {
      map.set(para.id, index + 1);
    });
    return map;
  }, [paragraphs]);

  return (
    <Card className="max-w-3xl w-full border-none shadow-none flex-1 min-h-0 overflow-auto">
      <CardContent>
        <div className="prose max-w-none">
          <div>
            {summary.summary.map((part, partIndex) => {
              const uniqueSources = new Set(part.sourceParagraphs);
              const isParagraphBreak =
                (partIndex + 1) % 4 === 0 &&
                partIndex !== summary.summary.length - 1;

              return (
                <React.Fragment key={partIndex}>
                  <span className="inline whitespace-pre-wrap">
                    {part.text}
                    {/* Citations appear only if refMap exists */}
                    {refMap &&
                      [...uniqueSources].map((id) => {
                        const refNum = refMap.get(id);
                        if (!refNum) return null;

                        return (
                          <span
                            key={id}
                            className="w-5 h-5 justify-center rounded-full text-xs font-semibold cursor-pointer hover:scale-150 ml-1 inline-flex items-center bg-blue-200 p-0"
                            onClick={() => onCitationClick(id)}
                          >
                            {refNum}
                          </span>
                        );
                      })}
                    {partIndex < summary.summary.length - 1 && " "}
                  </span>
                  {isParagraphBreak && <br />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
