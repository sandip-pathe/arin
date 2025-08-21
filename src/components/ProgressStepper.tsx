import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCheckCheck } from "react-icons/lu";

interface ThinkingLoaderProps {
  totalTime: number;
  paragraphsCount: number;
  wordsCount: number;
  currentModel: string;
}

// Step definitions
const steps = [
  "Reading Document",
  "Finding Information",
  "Identifying Clauses",
  "Collecting Info",
  "Compiling Analysis",
];

// Time estimation formula based on your performance data
const estimateTotalTime = (paragraphsCount: number): number => {
  // Base time for setup and processing
  const baseTime = 2000; // 2 seconds

  // Time for batch processing (from logs: ~4.4s per 100 paragraphs)
  const batchProcessingTime = (paragraphsCount / 100) * 4400;

  // Time for aggregation (from logs: ~3.8s)
  const aggregationTime = 3800;

  // Calculate total estimated time in ms
  const estimatedTime = baseTime + batchProcessingTime + aggregationTime;

  // Ensure minimum time of 8 seconds and maximum of 60 seconds
  return Math.min(Math.max(estimatedTime, 8000), 60000);
};

export function ThinkingLoader({
  totalTime,
  paragraphsCount,
  wordsCount,
  currentModel,
}: ThinkingLoaderProps) {
  const [estimatedTotalTime] = useState(() =>
    estimateTotalTime(paragraphsCount)
  );

  // Calculate progress percentage (0 to 1)
  const progress = Math.min(totalTime / estimatedTotalTime, 1);

  // Determine which steps should be visible based on progress
  const visibleSteps = Math.floor(progress * steps.length);

  return (
    <AnimatePresence>
      <motion.div
        className="w-full font-sans my-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        {/* Document info */}
        <div className="text-xs text-gray-500 mb-2 text-center">
          Analyzing {paragraphsCount} paragraphs ({wordsCount} words) with{" "}
          {currentModel}
        </div>

        <div className="w-full bg-gray-200 h-px mb-8 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gray-800"
            style={{ width: "40%" }}
            initial={{ x: "-100%" }}
            animate={{ x: ["-100%", "350%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Steps under loader */}
        <div className="flex flex-col items-start gap-1 mt-2">
          {steps.map((step, index) => {
            const isComplete = index < visibleSteps;
            const isCurrent = index === visibleSteps;

            return (
              <AnimatePresence key={index}>
                {(isComplete || isCurrent) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    {isComplete ? (
                      // 🎉 Animated icon on completion
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }} // pop effect
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <LuCheckCheck
                          className="text-gray-500 w-4 h-4"
                          size={12}
                        />
                      </motion.div>
                    ) : (
                      <span className="text-sm text-blue-600">
                        {step}
                        <span className="inline-flex ml-2"></span>
                        {
                          [".", ". .", ". . ."][
                            Math.floor((totalTime / 600) % 3)
                          ]
                        }
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
