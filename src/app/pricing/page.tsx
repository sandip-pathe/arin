"use client";

import { motion } from "framer-motion";
import { FiCheck, FiStar, FiBriefcase } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaWhatsapp } from "react-icons/fa6";
import Footer from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";
import SecondaryCTAs from "@/components/settings/secondary-cta";

const plans = [
  {
    id: "basic",
    title: "Basic",
    price: " ₹499/ month",
    annualDiscount: " ₹4999/ year",
    annual: "20% Off",
    description: "Best for students, light users, or casual checks.",
    features: [
      "Process 1 doc at a time",
      "Limited follow-up chats",
      "Standard speed",
      "PDF exports",
    ],
    cta: "Get Basic",
    recommended: false,
  },
  {
    id: "pro",
    title: "Pro",
    price: " ₹1499/ month",
    annualDiscount: " ₹13490/ year",
    annual: "25% Off",
    description: "For practicing lawyers & power users who need reliability.",
    features: [
      "Process multiple docs in one case",
      "Unlimited follow-up chats",
      "Priority queue (faster responses)",
      "All AI models (GPT-4o, Gemini, Claude)",
      "Priority support",
      "Clean, professional exports (no watermark)",
    ],
    cta: "Upgrade to Pro",
    recommended: true,
  },
  {
    id: "enterprise",
    title: "Enterprise",
    price: "Custom Pricing",
    description: "For firms and organizations needing advanced controls.",
    features: [
      "Unlimited document processing",
      "Unified workspace for teams",
      "Single place repository of all documents",
      "Team collaboration & admin tools",
      "Custom AI model integrations",
      "Dedicated account manager",
      "SLA-backed support",
    ],
    cta: "Contact Sales",
    recommended: false,
  },
];

export default function PricingPage() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handlePayClick = (planId: string) => {
    setSelectedPlan(planId);
    setOpenModal(true);
  };

  const whatsappLink = `https://wa.me/918767394523?text=${encodeURIComponent(
    `Hello Anaya Team,
     I am interested in buying ${selectedPlan?.toUpperCase()}.
     \nId: ${user?.uid}
    \nName: ${user?.displayName}`
  )}`;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}

      <section className="text-center py-12 px-4 sm:py-16 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold"
        >
          Upgrade your plan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg"
        >
          No hidden fees. Upgrade when you're ready.
        </motion.p>
      </section>

      {/* Plan Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`${plan.recommended ? "lg:scale-105" : ""}`}
            >
              <Card
                className={`flex flex-col justify-between h-full p-6 sm:p-8 shadow-lg border rounded-xl sm:rounded-2xl ${
                  plan.recommended
                    ? "ring-1 sm:ring-2 ring-emerald-500 bg-white"
                    : "bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold">
                      {plan.title}
                    </h3>
                    {plan.recommended && (
                      <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                        <FiStar className="w-3 h-3" /> Most Popular
                      </div>
                    )}
                    {plan.id === "enterprise" && (
                      <div className="flex items-center gap-1 bg-gray-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                        <FiBriefcase className="w-3 h-3" /> Enterprise
                      </div>
                    )}
                  </div>

                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3 sm:mt-4">
                    {plan.price}
                  </p>
                  <div className="flex flex-row gap-2 font-semibold my-2 text-sm sm:text-base">
                    <p>{plan.annualDiscount}</p>
                    <p className="text-primary font-bold">{plan.annual}</p>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {plan.description}
                  </p>

                  <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-sm">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex gap-2">
                        <FiCheck className="text-green-500 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 sm:mt-8">
                  <Button
                    onClick={() => handlePayClick(plan.id)}
                    className={`w-full text-sm sm:text-base ${
                      plan.recommended
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : plan.id === "enterprise"
                        ? "bg-gray-800 hover:bg-gray-900"
                        : ""
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <div className="text-center space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-emerald-600">
                Payments are not working right now
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Open a chat with us on WhatsApp for manual verification.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full"
              >
                <Button
                  className="p-2 sm:p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all"
                  size="sm"
                >
                  <FaWhatsapp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Open WhatsApp Chat
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      <SecondaryCTAs current="pricing" />
      <Footer />
    </div>
  );
}
