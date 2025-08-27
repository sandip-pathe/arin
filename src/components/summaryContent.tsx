// SummaryContent.tsx (inline prose with periodic paragraph breaks)
import React from "react";
import { Card, CardContent } from "./ui/card";
import { SummaryItem, Paragraph } from "@/types/page";
import { logPerf } from "@/lib/hi";

type SummaryContentProps = {
  summary: SummaryItem;
  paragraphs: Paragraph[];
  onCitationClick: (sourceId: string) => void;
};

export default function SummaryContent({
  summary,
  paragraphs,
  onCitationClick,
}: SummaryContentProps) {
  const { refMap } = React.useMemo(() => {
    const refMap = new Map<string, number>();
    const paraMap = new Map<string, Paragraph>();

    paragraphs.forEach((para, index) => {
      refMap.set(para.id, index + 1);
      paraMap.set(para.id, para);
    });

    return { refMap, paraMap };
  }, [paragraphs]);

  return (
    <>
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
                      {/* Citations inline */}
                      {[...uniqueSources].map((id) => {
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

      {/* <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTitle className="sr-only">Source Reference</SheetTitle>
        <SheetContent side="right" className="overflow-y-auto p-6 sm:max-w-xl">
          <div className="prose">
            <button
              onClick={() => setSheetOpen(false)}
              className="fixed top-4 right-6 z-100 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-700 shadow"
              aria-label="Close"
            >
              &#10005;
            </button>
            <h2 className="text-lg font-semibold px-4 text-gray-700">
              {summary.title || "Sources"}
            </h2>
            {paragraphs.map((para) => (
              <div
                key={para.id}
                ref={
                  para.id === currentSourceId
                    ? (el) => {
                        if (el) {
                          el.scrollIntoView({
                            behavior: "instant",
                            block: "center",
                          });
                        }
                      }
                    : undefined
                }
                className="rounded-none p-4"
              >
                <div
                  className={` ${
                    para.id === currentSourceId
                      ? "bg-blue-100"
                      : "bg-background"
                  }`}
                >
                  {formatContent(para.text)}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet> */}
    </>
  );
}
