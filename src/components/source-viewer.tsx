// CitationView.tsx
import React, { useEffect, useRef } from "react";
import { Paragraph } from "@/types/page";
import { formatContent } from "@/lib/content-formatting";
import { motion } from "framer-motion";
import { TbArrowsDiagonalMinimize } from "react-icons/tb";

interface CitationViewProps {
  sourceId: string | null;
  paragraphs: Paragraph[];
  onClose: () => void;
  title?: string;
}

const CitationView: React.FC<CitationViewProps> = ({
  sourceId,
  paragraphs,
  onClose,
  title = "Sources",
}) => {
  const highlightedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sourceId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [sourceId]);

  return (
    <div className="flex flex-col h-full">
      <div className="z-10 border-b flex items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <TbArrowsDiagonalMinimize
              className="cursor-pointer p-1 text-gray-600"
              size={24}
              onClick={onClose}
            />
          </motion.div>
          <div className="p-4 font-medium">{title}</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        <div className="prose max-w-none">
          {paragraphs.map((para) => (
            <div
              key={para.id}
              ref={para.id === sourceId ? highlightedRef : undefined}
              className={`rounded-none p-4 mb-2 ${
                para.id === sourceId
                  ? "bg-blue-100 border-l-4 border-blue-500"
                  : "bg-white"
              }`}
            >
              <div className="text-gray-800 text-justify">
                {formatContent(para.text)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitationView;
