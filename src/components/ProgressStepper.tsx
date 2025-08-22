import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LuCheckCheck } from "react-icons/lu";

interface ThinkingLoaderProps {
  isSummarizing: boolean;
  paragraphsCount: number;
}

// Step definitions
const steps = [
  "Reading Document",
  "Finding Information",
  "Identifying Clauses",
  "Collecting Info",
  "Compiling Analysis",
];

// Estimate total processing time
const estimateTotalTime = (paragraphsCount: number): number => {
  const base = 2000;
  const per100 = (paragraphsCount / 100) * 25000; // 25s per 100 paragraphs
  const batches = Math.ceil(paragraphsCount / 100);
  const aggregation = 3500 + batches * 2000;
  return Math.min(Math.max(base + per100 + aggregation, 8000), 60000);
};

// Split time across steps
const distributeStepDurations = (totalTime: number, stepCount: number) => {
  const baseStep = Math.floor(totalTime / stepCount);
  const durations = Array(stepCount).fill(baseStep);
  const leftover = totalTime - baseStep * stepCount;
  durations[stepCount - 1] += leftover; // give slack to last step
  return durations;
};

export function ThinkingLoader({
  isSummarizing,
  paragraphsCount,
}: ThinkingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const estimatedTotalTime = estimateTotalTime(paragraphsCount);
  const stepDurations = distributeStepDurations(
    estimatedTotalTime,
    steps.length
  );

  useEffect(() => {
    if (!isSummarizing) {
      setCurrentStep(steps.length);
      return;
    }

    let stepIndex = 0;
    setCurrentStep(0);

    const timers = stepDurations.map((duration, i) =>
      setTimeout(
        () => {
          stepIndex++;
          setCurrentStep(stepIndex);
        },
        stepDurations.slice(0, i + 1).reduce((a, b) => a + b, 0)
      )
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [isSummarizing, estimatedTotalTime]);

  console.log("Estimated total time:", estimatedTotalTime);
  console.log(paragraphsCount, "paragraphs");

  return (
    <motion.div
      className="w-full font-sans my-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Shimmer loader bar */}
      <div className="w-full bg-gray-200 h-px mb-8 relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gray-800"
          animate={{ x: ["-100%", "350%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col items-start gap-1 mt-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              {isComplete ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <LuCheckCheck className="text-gray-500 w-4 h-4" size={12} />
                </motion.div>
              ) : isCurrent ? (
                <span className="text-sm text-blue-600">
                  {step}
                  <span className="ml-2 inline-flex animate-pulse">
                    {[".", "..", "..."][Math.floor(Date.now() / 300) % 3]}
                  </span>
                </span>
              ) : (
                <span className="text-sm text-gray-400">{step}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
