"use client";

import { useState, useEffect } from "react";
import { Copy, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import SecondaryCTAs from "@/components/settings/secondary-cta";
import { motion } from "framer-motion";
import { FaLinkedin, FaWhatsapp, FaTwitter } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import { FaShareAlt, FaTrophy, FaUsers } from "react-icons/fa";

export default function ReferralPage() {
  const { user, membership } = useAuthStore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Share actions
  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      `https://app.anaya.ai/?ref=${user?.uid}`
    )}`;
    window.open(url, "_blank");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      "Check out Anaya, the legal doc summarizer that saves hours of work!"
    );
    const url = `https://wa.me/?text=${text}%20${encodeURIComponent(
      `https://app.anaya.ai/?ref=${user?.uid}`
    )}`;
    window.open(url, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      "Check out Anaya, the legal doc summarizer that saves hours of work!"
    );
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
      `https://app.anaya.ai/?ref=${user?.uid}`
    )}`;
    window.open(url, "_blank");
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://app.anaya.ai/?ref=${user?.uid}`);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Anaya - Legal Document Summarizer",
          text: "Check out Anaya, the legal doc summarizer that saves hours of work!",
          url: `https://app.anaya.ai/?ref=${user?.uid}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerChildren = {
    visible: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-foreground">
      {/* HERO */}
      <section className="relative py-12 px-4 sm:py-16 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="text-center max-w-3xl mx-auto relative z-10"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Referral Program
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
          >
            Lawyers shouldn't waste hours on documents.
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto"
          >
            Share Anaya with peers. They save time, you earn free credits.
          </motion.p>

          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
          >
            <Button
              onClick={copyReferralLink}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full transition-all text-sm sm:text-base"
              size="sm"
            >
              {copied ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              {copied ? "Copied!" : "Copy Referral Link"}
            </Button>

            {isMobile && "share" in navigator && (
              <Button
                onClick={handleNativeShare}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full transition-all text-sm sm:text-base"
                size="sm"
              >
                <FaShareAlt className="h-4 w-4 sm:h-5 sm:w-5" />
                Share
              </Button>
            )}

            <div className="flex justify-center gap-2">
              <Button
                onClick={shareOnLinkedIn}
                className="p-2 sm:p-3 bg-blue-800 hover:bg-blue-900 text-white rounded-full transition-all"
                size="sm"
              >
                <FaLinkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                onClick={shareOnWhatsApp}
                className="p-2 sm:p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all"
                size="sm"
              >
                <FaWhatsapp className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                onClick={shareOnTwitter}
                className="p-2 sm:p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full transition-all"
                size="sm"
              >
                <FaTwitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4 text-gray-900">
              How It Works
            </h2>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700 text-center">
              <li>1. Share your link with colleagues</li>
              <li>2. They sign up and start with free credits</li>
              <li>3. You earn +5 credits for every referral</li>
            </ul>
          </div>

          {/* REWARD TRACKER */}
          <div className="max-w-md mx-auto mt-6 sm:mt-10 text-center">
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              🎉 You've earned{" "}
              <span className="text-blue-600">
                {membership.pagesRemaining ?? 0}
              </span>{" "}
              credits
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Share with{" "}
              <span className="font-medium text-gray-800">2 more</span>{" "}
              colleagues to unlock your next reward (+5 credits)
            </p>
          </div>
        </div>

        {/* Animated background elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-10 sm:top-20 left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 bg-blue-200 rounded-full blur-xl opacity-30"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-20 h-20 sm:w-32 sm:h-32 bg-purple-200 rounded-full blur-xl opacity-30"
        ></motion.div>
      </section>

      <SecondaryCTAs current="referral" />
    </div>
  );
}
