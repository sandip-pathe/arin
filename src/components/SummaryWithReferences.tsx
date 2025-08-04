import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Chunk = {
  id: string;
  content: string;
  documentName: string;
};

type Props = {
  text: string;
  chunkIds: string[];
  getChunkById: (id: string) => Chunk | undefined;
};

export const SummaryWithReferences: React.FC<Props> = ({
  text,
  chunkIds,
  getChunkById,
}) => {
  return (
    <div className="space-y-4">
      {text.split("\n").map((para, idx) => {
        const parts = [];
        let lastIndex = 0;
        const regex = /\{\{(\d+)\}\}/g;
        let match;
        let keyCount = 0;

        while ((match = regex.exec(para)) !== null) {
          const index = parseInt(match[1], 10);
          const chunkId = chunkIds[index];
          const chunk = chunkId ? getChunkById(chunkId) : undefined;

          console.log({ match: match[0], index, chunkId, chunk });

          if (match.index > lastIndex) {
            parts.push(
              <React.Fragment key={`text-${idx}-${keyCount++}`}>
                {para.slice(lastIndex, match.index)}
              </React.Fragment>
            );
          }

          if (chunk) {
            parts.push(
              <span
                key={`ref-${idx}-${index}`}
                className="inline-flex items-center"
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <sup className="text-blue-500 font-semibold cursor-pointer hover:underline mx-0.5">
                      [{index + 1}]
                    </sup>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xl text-sm whitespace-pre-wrap z-50">
                    <div className="font-medium mb-1">
                      Reference to chunk {index + 1}:
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {chunk.documentName}
                    </div>
                    <div>{chunk.content}</div>
                  </PopoverContent>
                </Popover>
              </span>
            );
          } else {
            parts.push(
              <sup
                key={`missing-${idx}-${index}`}
                className="text-red-500 font-semibold mx-0.5"
                title="Missing reference"
              >
                [?]
              </sup>
            );
          }

          lastIndex = match.index + match[0].length;
        }

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
            className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed"
          >
            {parts}
          </p>
        );
      })}
    </div>
  );
};
