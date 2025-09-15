"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  Timestamp,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users, Rocket } from "lucide-react";
import SecondaryCTAs from "@/components/settings/secondary-cta";

// Define types for questions
type QuestionType = "text" | "textarea" | "radio" | "checkbox";

interface QuestionOption {
  id: string;
  label: string;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
}

interface Answers {
  [key: string]: string | string[];
}

// Demo questions (fallback if Firestore is unavailable)
const DEMO_QUESTIONS: Question[] = [
  {
    id: "name",
    text: "What is your name or role?",
    type: "text",
    required: true,
  },
  {
    id: "work",
    text: "What do you work on?",
    type: "text",
    required: true,
  },
  {
    id: "pain",
    text: "What's your biggest pain point with legal documents?",
    type: "textarea",
    required: true,
  },
  {
    id: "hear",
    text: "How did you hear about us?",
    type: "radio",
    required: false,
    options: [
      { id: "friend", label: "Friend or Colleague" },
      { id: "search", label: "Online Search" },
      { id: "social", label: "Social Media" },
      { id: "other", label: "Other" },
    ],
  },
];

export default function EvangelistPage() {
  const { user, updateMembership, membership } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>(DEMO_QUESTIONS);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const docRef = doc(db, "lean", "questions");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setQuestions(data.questions || DEMO_QUESTIONS);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Keep the demo questions if Firestore fails
      }
    };

    fetchQuestions();
    // Check if mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Save answers to Firestore
      await addDoc(collection(db, "evangelist_responses"), {
        uid: user.uid,
        answers,
        createdAt: Timestamp.now(),
      });

      // Reward +7 credits
      updateMembership({
        pagesRemaining: (membership.pagesRemaining || 0) + 7,
      });

      setShowCompletion(true);
      console.log("Evangelist form submitted successfully");
    } catch (err: any) {
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question.id] || "";

    switch (question.type) {
      case "text":
        return (
          <Input
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="rounded-lg sm:rounded-xl"
            placeholder="Type your answer..."
          />
        );

      case "textarea":
        return (
          <Textarea
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="rounded-lg sm:rounded-xl"
            placeholder="Share your thoughts..."
          />
        );

      case "radio":
        return (
          <div className="space-y-2 sm:space-y-3">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={currentAnswer === option.id}
                  onChange={() => handleAnswerChange(question.id, option.id)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 text-sm sm:text-base">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2 sm:space-y-3">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <input
                  type="checkbox"
                  name={question.id}
                  value={option.id}
                  checked={((currentAnswer as string[]) || []).includes(
                    option.id
                  )}
                  onChange={(e) => {
                    const current = (currentAnswer as string[]) || [];
                    const newValue = e.target.checked
                      ? [...current, option.id]
                      : current.filter((id) => id !== option.id);
                    handleAnswerChange(question.id, newValue);
                  }}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 text-sm sm:text-base">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
            Your feedback has been submitted. You've received{" "}
            <span className="font-semibold">+7 document credits</span>!
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-primary hover:bg-primary/90 text-sm sm:text-base"
            size="sm"
          >
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-blue-200 text-primary rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          Exclusive Beta Program
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">
          Become an <span className="text-primary">Evangelist</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-gray-600">
          Join our inner circle of early believers. Share your insights,
          co-create with us, and unlock{" "}
          <span className="font-semibold text-gray-900">+7 free documents</span>{" "}
          instantly.
        </p>
      </motion.div>

      {/* Questions Form */}
      <div className="max-w-xl mx-auto">
        <Card className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 bg-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Quick Questions</h2>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {Math.round(
                  ((currentQuestionIndex + 1) / questions.length) * 100
                )}
                % Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Question Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-1">
                  {questions[currentQuestionIndex].text}
                  {questions[currentQuestionIndex].required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  Your feedback helps us improve
                </p>

                {renderQuestion(questions[currentQuestionIndex])}
              </div>

              <div className="flex justify-between pt-3 sm:pt-4">
                <Button
                  onClick={handleBack}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="rounded-lg sm:rounded-xl text-xs sm:text-sm"
                  size="sm"
                >
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={
                    questions[currentQuestionIndex].required &&
                    (!answers[questions[currentQuestionIndex].id] ||
                      (Array.isArray(
                        answers[questions[currentQuestionIndex].id]
                      ) &&
                        answers[questions[currentQuestionIndex].id].length ===
                          0))
                  }
                  className="rounded-lg sm:rounded-xl bg-primary hover:bg-primary/80 text-xs sm:text-sm"
                  size="sm"
                >
                  {currentQuestionIndex === questions.length - 1
                    ? loading
                      ? "Submitting..."
                      : "Submit & Get +7 Credits"
                    : "Next"}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>

      {/* Benefits Section (3 in a row, clean styling) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="max-w-5xl mx-auto mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 text-center"
      >
        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" />
          <h3 className="font-semibold text-sm sm:text-base text-gray-900">
            Early Access
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Try upcoming features before anyone else, and guide our roadmap.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
          <h3 className="font-semibold text-sm sm:text-base text-gray-900">
            Direct Impact
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Your feedback is gold. Help shape how AI transforms legal work.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
          <Rocket className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-pink-600" />
          <h3 className="font-semibold text-sm sm:text-base text-gray-900">
            Recognition
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Get a special badge in-app and become part of our founding circle.
          </p>
        </div>
      </motion.div>

      <SecondaryCTAs current="join" />
    </div>
  );
}
