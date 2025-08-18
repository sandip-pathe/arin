// SummaryContent.tsx (inline prose with periodic paragraph breaks)
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { SummaryItem, Paragraph } from "@/types/page";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatContent } from "@/lib/content-formatting";
import { MdVerified, MdGavel, MdEvent, MdPeople } from "react-icons/md";
import { TbFileDescription, TbArrowForwardUp } from "react-icons/tb";
import { FaBalanceScale, FaBook } from "react-icons/fa";

type SummaryContentProps = {
  summaries: SummaryItem[];
  paragraphs: Paragraph[];
};

const ONTOLOGY_ICONS: Record<string, JSX.Element> = {
  definitions: <TbFileDescription size={14} className="text-gray-600" />,
  obligations: <FaBalanceScale size={14} className="text-red-600" />,
  rights: <MdVerified size={14} className="text-green-600" />,
  conditions: <TbArrowForwardUp size={14} className="text-blue-600" />,
  clauses: <FaBook size={14} className="text-purple-600" />,
  dates: <MdEvent size={14} className="text-orange-600" />,
  parties: <MdPeople size={14} className="text-pink-600" />,
};

export default function SummaryContent({
  summaries,
  paragraphs,
}: SummaryContentProps) {
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Build reference and paragraph maps in one pass
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

                          // Find which ontology bucket this ID belongs to
                          let icon: JSX.Element = <MdVerified size={14} />;
                          for (const [key, values] of Object.entries(
                            summaryItem.legalOntology
                          )) {
                            if (values.includes(id)) {
                              icon = ONTOLOGY_ICONS[key] ?? icon;
                              break;
                            }
                          }

                          return (
                            <span
                              key={id}
                              className="cursor-pointer ml-1 inline-flex items-center"
                              onClick={() => handleCitationClick(id)}
                            >
                              {icon}
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
