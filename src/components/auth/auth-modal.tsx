"use client";

import { useAuthModalStore } from "@/store/auth-modal-store";
import LoginForm from "./login-form";
import SignupForm from "./register-form";
import Logo from "@/components/logo";

export default function AuthModal() {
  const { isOpen, type: mode } = useAuthModalStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-center font-headline text-2xl lg:text-3xl mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {mode === "login"
              ? "Please sign in to your account"
              : "Fill the details to sign up"}
          </p>

          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
}
