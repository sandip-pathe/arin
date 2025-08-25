"use client";
import { motion } from "framer-motion";

export default function MasterLoader() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-neutral-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex flex-col items-center select-none"
      >
        {/* Wordmark */}
        <h1
          className="
            font-logo text-5xl md:text-6xl font-black tracking-tight
            anaya-gradient
          "
          style={{
            animation: "anaya-shimmer 2.8s ease-in-out infinite",
            // keep layout stable during animation
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          Anaya
        </h1>

        {/* Underline (center-out grow) */}
        <span
          aria-hidden
          className="anaya-underline-bar anaya-underline block h-[2px] rounded-full mt-3 mx-auto"
          style={{
            animation: "anaya-underline-grow 2.2s ease-in-out infinite",
          }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="mt-5 text-neutral-500 text-base md:text-lg font-medium tracking-wide"
        >
          The Legal Intelligence Platform
        </motion.p>
      </motion.div>
    </div>
  );
}
