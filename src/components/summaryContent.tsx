// SummaryContent.tsx (inline prose with periodic paragraph breaks)
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { SummaryItem, Paragraph } from "@/types/page";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatContent } from "@/lib/content-formatting";
import { MdVerified, MdEvent, MdPeople } from "react-icons/md";
import { TbFileDescription, TbArrowForwardUp } from "react-icons/tb";
import { FaBalanceScale, FaBook } from "react-icons/fa";

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

  const { refMap, paraMap } = React.useMemo(() => {
    const refMap = new Map<string, number>();
    const paraMap = new Map<string, Paragraph>();

    paragraphs.forEach((para, index) => {
      refMap.set(para.id, index + 1);
      paraMap.set(para.id, para);
    });

    return { refMap, paraMap };
  }, [paragraphs]);

  const handleCitationClick = (id: string) => {
    setCurrentSourceId(id);
    setSheetOpen(true);
  };

  console.log("summaries", summaries);
  console.log("paragraphs", paragraphs);

  return (
    <>
      <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
        <CardContent className="max-w-3xl">
          <div className="prose max-w-none">
            {summaries.map((summaryItem, idx) => (
              <div key={idx}>
                {/* Flatten into inline prose */}
                {summaryItem.summary.map((part, partIndex) => {
                  const uniqueSources = new Set(part.sourceParagraphs);
                  const isParagraphBreak =
                    (partIndex + 1) % 4 === 0 &&
                    partIndex !== summaryItem.summary.length - 1;

                  return (
                    <React.Fragment key={partIndex}>
                      <span className="inline">
                        {part.text}
                        {/* Citations inline */}
                        {[...uniqueSources].map((id) => {
                          const refNum = refMap.get(id);
                          if (!refNum) return null;

                          return (
                            <span
                              key={id}
                              className="w-5 h-5 justify-center rounded-full text-xs font-semibold cursor-pointer hover:scale-150 ml-1 inline-flex items-center bg-blue-200 p-0"
                              onClick={() => handleCitationClick(id)}
                            >
                              {refNum}
                            </span>
                          );
                        })}
                        {partIndex < summaryItem.summary.length - 1 && " "}
                      </span>
                      {isParagraphBreak && <br />}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
              {summaries[0]?.title || "Sources"}
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
      </Sheet>
    </>
  );
}
