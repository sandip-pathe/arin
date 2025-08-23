"use client";

import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ChatWelcome() {
  const { user } = useAuthStore();
  const displayName = user?.displayName?.split(" ")[0] || "";

  const fullText = displayName ? `Welcome Back ${displayName},` : "";
  const [shownText, setShownText] = useState("");
  const [done, setDone] = useState(false);
  const [shine, setShine] = useState(false);

  useEffect(() => {
    if (!fullText) return;

    let i = 0;
    const interval = setInterval(() => {
      setShownText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) {
        clearInterval(interval);
        setDone(true);
        setTimeout(() => setShine(true), 200);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="select-none">
      <div className="text-left flex flex-row items-baseline gap-2 relative overflow-hidden">
        {/* Streaming Heading */}
        <h1 className="relative font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl inline-block">
          <span className="bg-blue-900 bg-clip-text text-transparent">
            {shownText}
          </span>

          {/* Glossy shine overlay */}
          {shine && (
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              onAnimationComplete={() => setShine(false)}
            />
          )}
        </h1>

        {/* Tagline */}
        {done && (
          <motion.span
            className="text-xl ml-2 font-medium font-logo text-primary mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            Let’s dig in.
          </motion.span>
        )}
      </div>
    </div>
  );
}
