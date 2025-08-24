import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LuCheckCheck } from "react-icons/lu";

interface ThinkingLoaderProps {
  isSummarizing: boolean;
  paragraphsCount: number;
  wordsCount?: number;
}

// Steps
const steps = [
  "Reading Document",
  "Finding Information",
  "Identifying Clauses",
  "Collecting Insights",
  "Compiling Final Analysis",
];

// Estimate total processing time
const estimateTotalTime = (paragraphsCount: number): number => {
  const base = 2000;
  const per100 = (paragraphsCount / 100) * 50000; // 50s per 100 paragraphs
  const batches = Math.ceil(paragraphsCount / 100);
  const aggregation = 3500 + batches * 2000;
  return Math.min(Math.max(base + per100 + aggregation, 10000), 60000);
};

// Split time across steps
const distributeStepDurations = (totalTime: number, stepCount: number) => {
  const baseStep = Math.floor(totalTime / stepCount);
  const durations = Array(stepCount).fill(baseStep);
  const leftover = totalTime - baseStep * stepCount;
  durations[stepCount - 1] += leftover;
  return durations;
};

export function ThinkingLoader({
  isSummarizing,
  paragraphsCount,
  wordsCount,
}: ThinkingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const estimatedTotalTime = estimateTotalTime(paragraphsCount);
  const stepDurations = distributeStepDurations(
    estimatedTotalTime,
    steps.length
  );

  const secondsEstimate = Math.floor(estimatedTotalTime / 1000);
  console.log("Paragraphs:", paragraphsCount);
  console.log("Estimated Time:", secondsEstimate);
  console.log("Step Durations:", stepDurations);

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

  return (
    <motion.div
      className="w-full max-w-lg mx-auto font-sans my-6 bg-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800">
        Summarizing your document
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        {paragraphsCount} paragraphs
        {wordsCount ? ` • ~${wordsCount.toLocaleString()} words` : ""}
        &nbsp;| Estimated {secondsEstimate}s
      </p>

      {/* Shimmer loader bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mt-4 relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          style={{ width: "40%" }}
          initial={{ x: "-100%" }}
          animate={{ x: ["-100%", "350%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-auto items-center justify-center">
        <div className="w-fit items-start gap-2 mt-4">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex items-center gap-2"
                  >
                    <LuCheckCheck className="text-green-500 w-4 h-4" />
                    <span className="text-sm text-gray-500 opacity-40">
                      {step}
                    </span>
                  </motion.div>
                ) : isCurrent ? (
                  <span className="text-sm font-medium text-indigo-600 flex items-center scale-150">
                    {step}
                    <motion.span
                      className="ml-2"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      ⏳
                    </motion.span>
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">{step}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer reassurance */}
      <p
        className={`text-xs mt-4 italic ${
          isSummarizing
            ? "text-sm font-medium text-indigo-600 flex items-center scale-150"
            : "text-gray-400"
        }`}
      >
        We’re carefully analyzing every detail to ensure accuracy and clarity.
      </p>
    </motion.div>
  );
}
