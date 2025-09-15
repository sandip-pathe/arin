"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust based on your Firebase config

// Type definitions
type QuestionType = "radio" | "checkbox" | "text" | "textarea" | "button";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  estimatedTime?: number;
}

interface Answers {
  [key: string]: any;
}

interface SurveyLoaderProps {
  time: number; // in seconds
  onComplete?: (answers: Answers) => void;
}

const DEMO_QUESTIONS: Question[] = [
  {
    id: "consent",
    type: "button",
    text: "Thank you for your patience. Every detail is being examined to ensure all potential issues are identified. This thorough review is necessary to protect your interests, and a summary and the next steps will be provided shortly. Would you like to answer a few questions while you wait?",
    options: ["Yes, I'd love to!", "No, thank you."],
    estimatedTime: 5,
  },
  {
    id: "q1",
    type: "radio",
    text: "How did you hear about us?",
    options: ["Friend", "Online Search", "Social Media", "Other"],
    estimatedTime: 5,
  },
  {
    id: "q2",
    type: "checkbox",
    text: "Which topics are you interested in?",
    options: ["Technology", "Business", "Health", "Education"],
    estimatedTime: 7,
  },
  {
    id: "q3",
    type: "text",
    text: "What is your primary goal?",
    estimatedTime: 10,
  },
  {
    id: "q4",
    type: "textarea",
    text: "Do you have any suggestions for us?",
    estimatedTime: 15,
  },
];

const getDefaultValue = (type: QuestionType) => {
  switch (type) {
    case "checkbox":
      return [];
    case "radio":
      return "";
    case "text":
      return "";
    case "textarea":
      return "";
    case "button":
      return null;
    default:
      return "";
  }
};

const QuestionComponent: React.FC<{
  question: Question;
  onAnswer: (answer: any) => void;
  initialAnswer?: any;
  questionNumber: number;
  totalQuestions: number;
  autoAdvance?: boolean;
  onAutoAdvance?: () => void;
}> = ({
  question,
  onAnswer,
  initialAnswer,
  questionNumber,
  totalQuestions,
  autoAdvance,
  onAutoAdvance,
}) => {
  const [answer, setAnswer] = useState<any>(
    initialAnswer || getDefaultValue(question.type)
  );
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnswer(initialAnswer || getDefaultValue(question.type));
  }, [question, initialAnswer]);

  useEffect(() => {
    if (autoAdvance && onAutoAdvance && question.type !== "button") {
      const timer = setTimeout(() => {
        onAutoAdvance();
      }, (question.estimatedTime || 5) * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoAdvance, question, onAutoAdvance]);

  useEffect(() => {
    if (autoAdvance && progressRef.current) {
      progressRef.current.style.width = "0%";
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = "100%";
        }
      }, 10);
    }
  }, [question, autoAdvance]);

  const handleChange = (value: any) => {
    let newAnswer;

    if (question.type === "checkbox") {
      newAnswer = answer ? [...answer] : [];
      const index = newAnswer.indexOf(value);

      if (index > -1) {
        newAnswer.splice(index, 1);
      } else {
        newAnswer.push(value);
      }
    } else {
      newAnswer = value;
    }

    setAnswer(newAnswer);
    onAnswer(newAnswer);
  };

  const handleButtonClick = (value: string) => {
    if (value === "Yes, I'd love to!") {
      onAnswer(true);
    } else {
      onAnswer(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 1.05 }}
      transition={{ duration: 0.5, type: "spring", damping: 15 }}
      className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100"
    >
      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            ref={progressRef}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: autoAdvance ? "0%" : "100%" }}
            animate={{ width: autoAdvance ? "100%" : "100%" }}
            transition={{
              duration: autoAdvance ? question.estimatedTime || 5 : 0.3,
              ease: "linear",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {question.text}
      </h3>

      {/* Auto-advance indicator */}
      {autoAdvance && question.type !== "button" && (
        <div className="text-xs text-gray-400 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          This question will auto-advance in {question.estimatedTime || 5}{" "}
          seconds
        </div>
      )}

      {/* Options based on question type */}
      {question.type === "radio" && (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <motion.label
              key={index}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={answer === option}
                onChange={() => handleChange(option)}
                className="mr-3 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">{option}</span>
            </motion.label>
          ))}
        </div>
      )}

      {question.type === "checkbox" && (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <motion.label
              key={index}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                name={question.id}
                value={option}
                checked={answer && answer.includes(option)}
                onChange={() => handleChange(option)}
                className="mr-3 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">{option}</span>
            </motion.label>
          ))}
        </div>
      )}

      {question.type === "text" && (
        <motion.input
          type="text"
          value={answer}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Type your answer here..."
          whileFocus={{ scale: 1.02 }}
        />
      )}

      {question.type === "textarea" && (
        <motion.textarea
          value={answer}
          onChange={(e) => handleChange(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Share your thoughts..."
          whileFocus={{ scale: 1.02 }}
        />
      )}

      {question.type === "button" && (
        <div className="flex flex-col space-y-3 mt-4">
          {question.options?.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleButtonClick(option)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const SurveyCompleted: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, type: "spring" }}
    className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 text-center"
  >
    <motion.div
      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
    >
      <svg
        className="w-8 h-8 text-green-600"
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
    </motion.div>
    <motion.p
      className="text-gray-600"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      Thank you for sharing your thoughts with us.
    </motion.p>
  </motion.div>
);

const SurveyLoader: React.FC<SurveyLoaderProps> = ({ time, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>(DEMO_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Fetch questions from Firestore
  //   useEffect(() => {
  //     const fetchQuestions = async () => {
  //       try {
  //         const querySnapshot = await getDocs(
  //           collection(db, "validate", "questions")
  //         );
  //         const questionsData: Question[] = [];
  //         querySnapshot.forEach((doc) => {
  //           questionsData.push({ id: doc.id, ...doc.data() } as Question);
  //         });

  //         if (questionsData.length > 0) {
  //           setQuestions(questionsData);
  //         } else {
  //           // Use demo questions if Firestore is empty
  //           setQuestions(DEMO_QUESTIONS);
  //         }
  //         setIsLoading(false);
  //       } catch (error) {
  //         console.error("Error fetching questions:", error);
  //         // Use demo questions if Firestore is unavailable
  //         setQuestions(DEMO_QUESTIONS);
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchQuestions();
  //   }, []);

  const handleAnswer = (answer: any) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer,
    };

    setAnswers(newAnswers);

    // For consent question
    if (currentQuestion.id === "consent") {
      setHasConsent(answer);
      if (!answer) {
        // User declined - complete immediately
        setIsCompleted(true);
        if (onComplete) onComplete(newAnswers);
        return;
      }
    }

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) onComplete(newAnswers);
    }
  };

  const handleAutoAdvance = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) onComplete(answers);
    }
  };

  // Save all answers when component unmounts or completes
  //   useEffect(() => {
  //     return () => {
  //       if (Object.keys(answers).length > 0) {
  //         saveAnswersToFirestore(answers);
  //       }
  //     };
  //   }, [answers]);

  //   useEffect(() => {
  //     if (isCompleted) {
  //       saveAnswersToFirestore(answers);
  //     }
  //   }, [isCompleted, answers]);

  const saveAnswersToFirestore = async (answers: Answers) => {
    try {
      await setDoc(doc(db, "survey_responses", sessionId), {
        ...answers,
        timestamp: new Date(),
        sessionId,
      });
    } catch (error) {
      console.error("Error saving answers:", error);
    }
  };

  //   if (isLoading) {
  //     return (
  //       <div className="flex justify-center items-center h-64">
  //         <motion.div
  //           className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
  //           animate={{ rotate: 360 }}
  //           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  //         />
  //       </div>
  //     );
  //   }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600">
        No questions available at the moment.
      </div>
    );
  }

  if (isCompleted) {
    return <SurveyCompleted />;
  }

  if (hasConsent === false) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 text-gray-600"
      >
        Thank you for your response. Your document is being processed.
      </motion.div>
    );
  }

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        <QuestionComponent
          key={currentQuestionIndex}
          question={questions[currentQuestionIndex]}
          onAnswer={handleAnswer}
          initialAnswer={answers[questions[currentQuestionIndex].id] || ""}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          autoAdvance={autoAdvance}
          onAutoAdvance={handleAutoAdvance}
        />
      </AnimatePresence>
      {questions[currentQuestionIndex].type !== "button" && (
        <div className="flex justify-center mt-4">
          <label className="flex items-center text-sm text-gray-500">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={() => setAutoAdvance(!autoAdvance)}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            Auto-advance questions
          </label>
        </div>
      )}
    </div>
  );
};

export default SurveyLoader;
