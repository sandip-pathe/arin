"use client";

import { useState } from "react";
import { db } from "@/lib/firebase"; // <-- adjust path to your firebase init
import { doc, setDoc } from "firebase/firestore";

interface Question {
  id: string;
  text: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
  persona: string[];
}

// your list of 14 questions
const pain: Question[] = [
  {
    id: "friction-01",
    text: "Tell me about the last time you had to read a document over 50 pages. What did you do first?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "friction-02",
    text: "Walk me through how long it actually took to prepare that file, step by step.",
    type: "text",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "friction-03",
    text: "What part of reading that document took the most time or made you lose sleep? Be specific.",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "friction-04",
    text: "When you’re under a deadline, what do you skip or shorten when going through long docs?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "friction-05",
    text: "Tell me about a time you missed an important detail in a doc — what happened next?",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "friction-06",
    text: "Describe the last rework or correction you did because a document was handled poorly.",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "friction-07",
    text: "How do poor scans or formatting mess up your day? Give a recent example.",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "friction-08",
    text: "When documents pile up, how do you decide which ones to delegate and which to do yourself?",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "friction-09",
    text: "What’s the single-most repetitive or boring task your team does on documents?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "friction-10",
    text: "Tell me about the last time your team argued about who had annotated the official file — what caused it?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "friction-11",
    text: "Have you ever lost time because you couldn’t find a citation or paragraph in a PDF? Walk me through that incident.",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "friction-12",
    text: "When you’re prepping for court, what do you wish took less time? Be specific.",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "friction-13",
    text: "Tell me about the most recent document that felt unstructured or impossible to skim — what did you do?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "friction-14",
    text: "What are the downstream consequences (client, court, billing) when document work is late or sloppy? Give a real example.",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
];

const need: Question[] = [
  {
    id: "need-01",
    text: "Tell me about the last time you used a tool to speed up reading or searching documents. What did you try and what happened?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "need-02",
    text: "When someone on the team made a summary for you, how often was it immediately useful vs. needing edits? Tell me about the last one.",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "need-03",
    text: "What’s the last 'hack' or trick you used to find a key clause or paragraph faster? Did it work?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "need-04",
    text: "Tell me about the last time you used an automated tool (OCR, search, AI) on a legal document. How did it perform?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "need-05",
    text: "When’s the last time you paid for a service to summarize or analyze documents? What did you get and was it worth it?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "need-06",
    text: "Describe how your team currently hands off summaries or annotations — what breaks in that flow?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "need-07",
    text: "Tell me about the last feature in any tool that actually saved you time. What was it and why did it help?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "need-08",
    text: "Have you ever trusted a machine-generated summary in court prep or client advice? What happened?",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "need-09",
    text: "Walk me through a recent instance where a search or summarization tool gave you wrong or irrelevant results.",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "need-10",
    text: "When a junior gives you a summary, what are the things you always check — describe the last one.",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
  {
    id: "need-11",
    text: "Tell me about the last time you needed a fast extract of key clauses or data and how you solved it.",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "need-12",
    text: "Which parts of a summary do you always re-write or check? Give a recent example.",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "need-13",
    text: "Have you ever abandoned a new tool because it didn’t fit how you work? Tell me the story.",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "need-14",
    text: "Tell me about a time you wished a tool could highlight citations/precedents automatically — what would that have changed?",
    type: "textarea",
    required: true,
    persona: ["litigator"],
  },
];

const willingness_to_pay: Question[] = [
  {
    id: "pay-01",
    text: "Tell me about the last software or service your team paid for to speed up legal work. Who approved it and why?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "pay-02",
    text: "When did you last pay for a subscription that saved you time? How much was it and was it renewed?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-03",
    text: "Think of the last time you or your firm bought a tool. What was the purchasing process from interest to payment?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "pay-04",
    text: "Tell me about a time you personally recommended buying a tool. What convinced you?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-05",
    text: "Have you ever paid for a one-off research or summary service? Who handled the payment and how much did it cost?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-06",
    text: "Describe the last time you weighed paying for convenience vs. doing the work in-house. What tipped the balance?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-07",
    text: "When budget is tight, what categories get cut first? How have legal tools fared in those conversations?",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "pay-08",
    text: "Tell me about the last time you pre-paid or committed money to get early access to a tool or beta. What made you take that step?",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-09",
    text: "Who signs the check for new software where you work? Tell me about the last approval.",
    type: "text",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "pay-10",
    text: "What price did you consider reasonable for a tool that saves you several hours a week? Describe where that number came from.",
    type: "text",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-11",
    text: "Have you ever used credits, discounts, or referral rewards to try a paid product? Tell me the last time.",
    type: "select",
    required: true,
    options: ["Yes", "No"],
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-12",
    text: "Tell me about a feature you’d be willing to pay extra for — not hypothetically, but a feature you actually paid for before.",
    type: "textarea",
    required: true,
    persona: ["litigator", "paralegal"],
  },
  {
    id: "pay-13",
    text: "When you decide not to buy, what are the real reasons (procurement, security, value)? Give a specific recent example.",
    type: "textarea",
    required: true,
    persona: ["paralegal"],
  },
  {
    id: "pay-14",
    text: "Tell me about a time you were offered an early-bird or founding price — did you take it? Why or why not?",
    type: "select",
    required: true,
    options: ["Yes — I took it", "No — I didn't take it"],
    persona: ["litigator", "paralegal"],
  },
];

export default function UploadQuestionsButton() {
  const [loading, setLoading] = useState(false);

  const uploadQuestions = async () => {
    try {
      setLoading(true);
      await setDoc(
        doc(db, "validate", "evangelists"),
        {
          pain,
        },
        { merge: true }
      );
      await setDoc(
        doc(db, "validate", "evangelists"),
        {
          need,
        },
        { merge: true }
      );
      await setDoc(
        doc(db, "validate", "evangelists"),
        {
          willingness_to_pay,
        },
        { merge: true }
      );

      alert("✅ Questions uploaded successfully!");
    } catch (err) {
      console.error("Error uploading questions:", err);
      alert("❌ Failed to upload questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={uploadQuestions}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Uploading..." : "Upload Questions"}
    </button>
  );
}
