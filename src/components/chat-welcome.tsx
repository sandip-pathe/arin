"use client";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ChatWelcome() {
  const { dbUser, user } = useAuthStore();
  const displayName = dbUser?.displayName?.split(" ")[0] || "";

  const [shownText, setShownText] = useState("");
  const [done, setDone] = useState(false);
  const [shine, setShine] = useState(false);
  const [fullText, setFullText] = useState("");

  // Decide greeting once based on localStorage
  useEffect(() => {
    if (!displayName || !user?.uid) return;

    const key = `greetingCount_${user.uid}`;
    let count = Number(localStorage.getItem(key)) || 0;

    const greeting =
      count < 2 ? `Welcome ${displayName},` : `Welcome Back ${displayName},`;

    setFullText(greeting);

    // Increment count for next visit
    localStorage.setItem(key, String(count + 1));
  }, [displayName, user?.uid]);

  // Animate the fullText
  useEffect(() => {
    if (!fullText) return;

    let i = 0;
    const interval = setInterval(() => {
      setShownText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) {
        clearInterval(interval);
        setDone(true);
        setTimeout(() => setShine(true), 100);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="select-none w-full">
      <div className="text-left flex flex-col sm:flex-row items-baseline gap-1 sm:gap-2 relative overflow-hidden">
        <h1 className="relative font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground inline-block">
          <span className="bg-blue-900 bg-clip-text text-transparent">
            {shownText}
          </span>
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
