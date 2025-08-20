// components/ThinkingLoader.tsx
import React, { useState, useEffect } from "react";
import { Brain, Search, BookOpen, Scale, Zap, Sparkles } from "lucide-react";

interface ThinkingLoaderProps {
  totalTime: number;
  paragraphsCount: number;
  wordsCount: number;
  currentModel: string;
}

export function ThinkingLoader({
  totalTime,
  paragraphsCount,
  wordsCount,
  currentModel,
}: ThinkingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const thinkingSteps = [
    {
      icon: Search,
      text: "Analyzing legal concepts and terminology",
      subtext: "Identifying key legal principles and definitions",
    },
    {
      icon: BookOpen,
      text: "Reading through document sections",
      subtext: "Processing paragraphs and understanding context",
    },
    {
      icon: Scale,
      text: "Extracting rights and obligations",
      subtext: "Identifying legal relationships and responsibilities",
    },
    {
      icon: Brain,
      text: "Synthesizing complex legal information",
      subtext: "Connecting concepts across multiple sections",
    },
    {
      icon: Zap,
      text: "Structuring the legal analysis",
      subtext: "Organizing findings into coherent summary",
    },
    {
      icon: Sparkles,
      text: "Finalizing comprehensive summary",
      subtext: "Ensuring accuracy and completeness",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % thinkingSteps.length);
    }, 4000); // Change step every 4 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const current = thinkingSteps[currentStep];
    const fullText = isDeleting ? "" : current.text;
    const speed = isDeleting ? 50 : 100;

    const timer = setTimeout(() => {
      setDisplayedText(
        fullText.substring(0, displayedText.length + (isDeleting ? -1 : 1))
      );

      if (!isDeleting && displayedText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setCurrentStep((prev) => (prev + 1) % thinkingSteps.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentStep, displayedText, isDeleting]);

  const CurrentIcon = thinkingSteps[currentStep].icon;

  return (
    <div className="">
      <div className="flex items-start gap-6">
        {/* Animated brain icon */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <CurrentIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute -inset-2 bg-blue-200 rounded-2xl opacity-50 animate-pulse"></div>
            <div className="absolute -inset-1 bg-blue-100 rounded-2xl opacity-30 animate-ping"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Analyzing Legal Document
            </h3>

            {/* Typewriter text */}
            <div className="text-gray-600 mb-1 h-8 flex items-center">
              <span className="font-medium">{displayedText}</span>
              <span className="animate-blink bg-gray-600 w-0.5 h-5 ml-1 inline-block"></span>
            </div>

            <p className="text-sm text-gray-500">
              {thinkingSteps[currentStep].subtext}
            </p>
          </div>

          {/* Progress and stats */}
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, (totalTime / 60000) * 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Processing with {currentModel}</span>
              <span>{Math.round(totalTime / 1000)}s</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{paragraphsCount} paragraphs</span>
              <span>•</span>
              <span>{wordsCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{Math.ceil(wordsCount / 500)} estimated pages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-4 right-4 opacity-30">
        <Scale className="w-6 h-6 text-blue-400 animate-float" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-20">
        <BookOpen className="w-5 h-5 text-purple-400 animate-float-delayed" />
      </div>
    </div>
  );
}
