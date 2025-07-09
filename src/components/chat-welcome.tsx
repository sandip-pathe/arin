'use client';

import { useAuth } from "@/contexts/auth-context";

export function ChatWelcome() {
  const { user } = useAuth();
  
  const displayName = user?.displayName?.split(' ')[0] || 'User';

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-4xl text-center">
          <h1 className="mt-8 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Welcome {displayName},
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/80 sm:text-xl">
          Your AI-powered legal assistant. How can I help you today?
        </p>
      </div>
    </div>
  )
}
