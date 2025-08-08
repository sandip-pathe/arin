"use client";

import { useAuthStore } from "@/store/auth-store";

export function ChatWelcome() {
  const { user, loading } = useAuthStore();

  const displayName = user?.displayName?.split(" ")[0] || "";

  return (
    <div className="select-none mx-auto">
      <div className="text-start flex flex-row items-baseline gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          <span className="bg-blue-900 bg-clip-text text-transparent">
            Welcome Back {displayName},
          </span>
        </h1>
        <span
          className={`text-xl ml-2 font-medium font-logo text-primary mt-4 transition-all duration-300 ease-in-out ${
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
