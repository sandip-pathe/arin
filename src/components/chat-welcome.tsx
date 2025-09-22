"use client";

import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ChatWelcome() {
  const { user } = useAuthStore();
  const displayName = user?.displayName?.split(" ")[0] || "";

  const [shownText, setShownText] = useState("");
  const [done, setDone] = useState(false);
  const [shine, setShine] = useState(false);

  // Determine greeting only once based on localStorage
  const greeting = (() => {
    if (!displayName || !user?.uid) return "";
    const key = `isNew_${user.uid}`;
    const isNew = localStorage.getItem(key) === "true";
    return isNew ? `Welcome ${displayName},` : `Welcome Back ${displayName},`;
  })();

  useEffect(() => {
    if (!greeting) return;

    let i = 0;
    const interval = setInterval(() => {
      setShownText(greeting.slice(0, i + 1));
      i++;
      if (i === greeting.length) {
        clearInterval(interval);
        setDone(true);
        setTimeout(() => setShine(true), 100);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [greeting]);

  return (
    <div className="select-none w-full">
      <div className="text-left flex flex-col sm:flex-row items-baseline gap-1 sm:gap-2 relative overflow-hidden">
        {/* Streaming Heading */}
        <h1 className="relative font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground inline-block">
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
            className="text-lg sm:text-xl md:text-2xl ml-0 sm:ml-2 font-medium font-logo text-primary mt-1 sm:mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            Let's dig in.
          </motion.span>
        )}
      </div>
    </div>
  );
}
