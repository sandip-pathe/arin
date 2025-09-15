"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Users,
  Rocket,
  Crown,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import SecondaryCTAs from "@/components/settings/secondary-cta";
import { DialogTitle } from "@radix-ui/react-dialog";
import UploadQuestionsButton from "@/components/lean/upload-to-firestore";

// Types for questions
interface Question {
  id: string;
  text: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
  persona: string[];
}

export default function EvangelistPage() {
  const { dbUser } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usertype] = useState<string>(dbUser?.type || "litigator");

  // fetch and filter questions by persona
  const fetchQuestions = async () => {
    try {
      const questionsDoc = await getDoc(doc(db, "validate", "evangelists"));
      if (!questionsDoc.exists()) return setQuestions([]);

      const allQuestions: Question[] = questionsDoc.data().need || [];

      // filter by persona
      const personaFiltered = allQuestions.filter(
        (q) => !q.persona || q.persona.includes(usertype)
      );

      // shuffle array
      const shuffled = [...personaFiltered].sort(() => 0.5 - Math.random());

      // pick random 3–4
      const limited = shuffled.slice(0, Math.floor(Math.random() * 2) + 3);

      setQuestions(limited);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (usertype) fetchQuestions();
  }, [usertype]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const missingAnswers = questions.filter(
      (q) => q.required && !answers[q.id]
    );

    if (missingAnswers.length > 0) {
      console.log("Please answer all required questions");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "evangelists"), {
        uid: dbUser?.uid,
        email: dbUser?.email,
        answers,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      setShowSuccess(true);
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (err: any) {
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  // current question
  const currentQuestion = questions[currentQuestionIndex];

  // 🔑 capture Enter to move next/submit
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      nextQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-blue-200 text-primary rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
          <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
          Founder's Inner Circle
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">
          Join Our <span className="text-primary">Founding Circle</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-gray-600">
          Help shape the future of legal technology. As a founding evangelist,
          you'll get free premium access and direct access to our founding team.
        </p>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="max-w-4xl mx-auto mb-12 sm:mb-16"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl font-bold text-primary">
                1
              </span>
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">
              Apply
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Share your experience and challenges with legal documents
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl font-bold text-primary">
                2
              </span>
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">
              Get Approved
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Our team will review your application within 24 hours
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl font-bold text-primary">
                3
              </span>
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">
              Enjoy Benefits
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Get premium access and join our exclusive community
            </p>
          </div>
        </div>
      </motion.div>

      {/* Application Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 bg-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">
              Become a Founding Evangelist
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-4 sm:mb-6"
              >
                <label className="block text-sm sm:text-base font-medium mb-2">
                  {currentQuestion.text}
                  {currentQuestion.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {currentQuestion.type === "textarea" ? (
                  <Textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Your answer..."
                    rows={4}
                    className="rounded-lg sm:rounded-xl"
                    required={currentQuestion.required}
                  />
                ) : (
                  <Input
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Your answer..."
                    className="rounded-lg sm:rounded-xl"
                    required={currentQuestion.required}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              size="sm"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={nextQuestion}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
              >
                Next
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="text-xs sm:text-sm"
                size="sm"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Perks Section as a Single Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="max-w-5xl mx-auto my-12 sm:my-16"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12">
          Evangelist Perks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 md:gap-12 text-center">
          <div className="flex flex-col items-center space-y-2 sm:space-y-3">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-500" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              Free Premium Access
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Unlimited document generation and all premium features at no cost.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 sm:space-y-3">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              Direct Founder Access
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Regular calls with our founding team to share feedback and ideas.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 sm:space-y-3">
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-pink-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              Early Feature Access
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Be the first to test new features and influence our roadmap.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 sm:space-y-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              Exclusive Community
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Join a private group of select users and experts.
            </p>
          </div>
        </div>
      </motion.div>

      <SecondaryCTAs current="evangelist" />

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogTitle className="sr-only">Success!</DialogTitle>
        <DialogDescription className="sr-only">
          Your application has been submitted successfully.
        </DialogDescription>
        <DialogContent className="sm:max-w-md p-4 sm:p-6">
          <div className="text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Thank you for joining our inner circle. Our team will review your
              application and get back to you within 24 hours.
            </p>
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full text-sm sm:text-base"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
