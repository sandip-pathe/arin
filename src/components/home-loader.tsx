"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MasterLoader() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-gradient-to-br from-white via-[#fafafa] to-[#f1f5f9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex flex-col items-center select-none"
      >
        {/* Logo */}
        <div className="relative">
          <Image
            src="/logo.png"
            alt="Anaya Logo"
            width={200}
            height={60}
            priority
            className="object-contain"
            style={{
              animation: "anaya-shimmer 2.8s ease-in-out infinite",
            }}
          />
        </div>

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
          className="mt-5 text-blue-500 text-base md:text-lg font-medium tracking-wide"
        >
          Privacy-First Legal Intelligence
        </motion.p>

        {/* Privacy indicators */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="mt-4 flex items-center gap-4 text-xs text-gray-600"
        >
          <div className="flex items-center gap-1">
            <span className="text-green-600">🔒</span>
            <span>Local Processing</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">🛡️</span>
            <span>Zero Storage</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">✓</span>
            <span>Encrypted</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
