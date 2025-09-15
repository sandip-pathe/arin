"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCheckCheck, LuClock } from "react-icons/lu";
import { BsInputCursorText } from "react-icons/bs";
import { legalNuggets } from "@/lib/nuggets+data";
import { endTimer, logPerf, startTimer } from "@/lib/hi";

interface ThinkingLoaderProps {
  isSummarizing: boolean;
  paragraphsCount: number;
}

// Steps
const steps = [
  "Reviewing your document",
  "Extracting key parties & entities",
  "Identifying clauses & obligations",
  "Organizing legal insights",
  "Preparing your case overview",
];

// Estimate total processing time based on performance data
const estimateTotalTime = (paragraphsCount: number): number => {
  const batches = Math.ceil(paragraphsCount / 50);
  const batchProcessingTime = 10000 + batches * 2000;
  const aggregationTime = 25000 + batches * 2000;

  return Math.min(
    Math.max(batchProcessingTime + aggregationTime, 15000),
    120000
  );
};

// Calculate step weights based on actual processing phases
const getStepWeights = (paragraphsCount: number) => {
  return [
    0.1,
    0.3, // Finding Information (batch processing heavy)
    0.2, // Identifying Clauses
    0.2, // Collecting Insights
    0.2, // Compiling Final Analysis (aggregation)
  ];
};

export function ThinkingLoader({
  isSummarizing,
  paragraphsCount,
}: ThinkingLoaderProps) {
  const timerId = startTimer("ThinkingLoader");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentNugget, setCurrentNugget] = useState(0);

  useEffect(() => {
    const nuggetInterval = setInterval(() => {
      setCurrentNugget((prev) => (prev + 1) % legalNuggets.length);
    }, 10000);
    return () => clearInterval(nuggetInterval);
  }, []);

  // Calculate estimated time and step durations
  const { estimatedTotalTime, stepDurations, stepWeights } = useMemo(() => {
    const totalTime = estimateTotalTime(paragraphsCount);
    const weights = getStepWeights(paragraphsCount);
    const durations = weights.map((weight) => weight * totalTime);

    return {
      estimatedTotalTime: totalTime,
      stepDurations: durations,
      stepWeights: weights,
    };
  }, [paragraphsCount]);

  const secondsEstimate = Math.ceil(estimatedTotalTime / 1000);
  logPerf("Estimated processing time", { seconds: secondsEstimate });

  useEffect(() => {
    if (!isSummarizing) {
      setCurrentStep(steps.length);
      setProgress(100);
      return;
    }

    setCurrentStep(0);
    setProgress(0);
    setElapsedTime(0);

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    // Calculate progress based on elapsed time
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min(100, (elapsed / estimatedTotalTime) * 100);
      setProgress(percentage);
    }, 200);

    // Update steps based on elapsed time
    const updateStep = () => {
      const elapsed = Date.now() - startTime;
      let accumulated = 0;
      let currentStepIndex = 0;

      for (let i = 0; i < stepDurations.length; i++) {
        accumulated += stepDurations[i];
        if (elapsed < accumulated) {
          break;
        }
        currentStepIndex = i + 1;
      }

      setCurrentStep(Math.min(currentStepIndex, steps.length));
    };

    const stepInterval = setInterval(updateStep, 500);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isSummarizing, estimatedTotalTime, stepDurations]);

  // Calculate time remaining
  const remainingTime = Math.max(0, estimatedTotalTime - elapsedTime);
  const remainingSeconds = Math.ceil(remainingTime / 1000);

  // Add the endtime(timerId) on close
  useEffect(() => {
    if (!isSummarizing) {
      setCurrentStep(steps.length);
      setProgress(100);
      // End the timer when summarizing is stopped
      endTimer(timerId);
      return;
    }
  }, [isSummarizing, timerId]);

  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2">
          <BsInputCursorText className="text-indigo-600 w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 inline">
            {remainingSeconds > 0 ? (
              <span>
                Processing {paragraphsCount} paragraphs in {remainingSeconds}s
              </span>
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent"
              />
            )}
          </h2>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 h-px rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Nuggets Zone - Did You Know Banner */}
      <div className="my-6">
        <AnimatePresence mode="wait">
          <div
            key={currentNugget}
            className="bg-indigo-50 border-l-4 border-indigo-500 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="p-2 bg-indigo-100 rounded-full">
                <span className="text-indigo-600 text-lg">💡</span>
              </div>

              {/* Text */}
              <div>
                <h4 className="text-sm font-semibold text-indigo-700">
                  Did You Know?
                </h4>
                <motion.div
                  key={currentNugget}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="mt-1"
                >
                  <p className="text-sm text-gray-700 mt-1">
                    {legalNuggets[currentNugget]}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </AnimatePresence>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LuCheckCheck className="text-green-500 w-5 h-5" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 rounded-full border-2 border-gray-900 border-t-gray-400"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* Step text */}
              <span
                className={`text-sm font-normal ${
                  isComplete
                    ? "text-gray-500"
                    : isCurrent
                    ? "text-gray-900 font-medium"
                    : "text-gray-300"
                }`}
              >
                {step}
              </span>

              {/* Time indicator for current step */}
              {isCurrent && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-400 ml-auto"
                >
                  <LuClock className="inline mr-1 w-3 h-3" />
                  {Math.ceil(stepDurations[index] / 1000)}s
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-xs mt-4 text-gray-500 italic"
        >
          We’re carefully analyzing every detail to ensure accuracy and clarity.
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
