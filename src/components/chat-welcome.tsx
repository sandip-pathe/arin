"use client";

import { useAuth } from "@/contexts/auth-context";

export function ChatWelcome() {
  const { user, loading } = useAuth();

  const displayName = user?.displayName?.split(" ")[0] || "User";

  return (
    <div className="select-none mb-6 flex flex-row items-center justify-between">
      <div className="text-start">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome Back {displayName},
          </span>
        </h1>
        <span
          className={`text-xl ml-2 font-medium font-logo text-primary mt-auto transition-all duration-300 ease-in-out ${
            !loading
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2 pointer-events-none"
          }`}
        >
          Let’s dig in.
        </span>
      </div>
    </div>
  );
}
