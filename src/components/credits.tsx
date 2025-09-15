"use client";

import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

interface CreditReminderProps {
  variant?: "home" | "header";
  className?: string;
}

export const CreditReminder = ({
  variant = "home",
  className = "",
}: CreditReminderProps) => {
  const { membership } = useAuthStore();

  // Only show for free/trial users
  if (membership.type !== "trial") return null;

  const pagesRemaining = membership.pagesRemaining ?? 0;
  const progressPercentage = (pagesRemaining / 10) * 100;

  if (variant === "header") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={` ${className}`}
      >
        <div className="flex  flex-row items-center justify-between">
          <div className="bg-gray-100 w-1/2 rounded-full h-1.5 mb-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                pagesRemaining > 5
                  ? "bg-blue-500"
                  : pagesRemaining > 2
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {pagesRemaining > 3
              ? `${10 - pagesRemaining} of 10 used`
              : `${pagesRemaining} left in trial`}
          </span>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <span>Pro</span>
            <FiArrowUpRight size={12} className="ml-0.5" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={` p-3 ${className}`}
    >
      <div className="flex items-center justify-between ">
        <div className="flex-1">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                pagesRemaining > 5
                  ? "bg-blue-500"
                  : pagesRemaining > 2
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center gap-3 justify-between">
            <span className="text-xs text-gray-500">
              {pagesRemaining > 3
                ? `${10 - pagesRemaining} of 10 used`
                : `${pagesRemaining} left in trial`}
            </span>

            {/* Upgrade indicator */}
            <div className="flex items-center text-xs text-blue-600 font-medium">
              <span>Pro</span>
              <FiArrowUpRight size={12} className="ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
