"use client";

import { useAuthModalStore } from "@/store/auth-modal-store";
import LoginForm from "./login-form";
import SignupForm from "./register-form";
import Logo from "@/components/logo";
import { Download, Save, Share2, FileText, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const getTriggerMessage = (trigger: string | null, mode: string) => {
  if (mode === "login") return "Please sign in to continue";

  switch (trigger) {
    case "download":
      return "Create a free account to download your summary";
    case "save":
      return "Sign up to save this summary and access it anytime";
    case "share":
      return "Create an account to share this with your team";
    case "limit_reached":
      return "You've processed 3 documents! Sign up for unlimited access";
    case "premium_feature":
      return "Unlock premium features with a free account";
    default:
      return "Start saving your legal work today";
  }
};

const getTriggerIcon = (trigger: string | null) => {
  switch (trigger) {
    case "download":
      return <Download className="h-8 w-8 text-blue-600" />;
    case "save":
      return <Save className="h-8 w-8 text-green-600" />;
    case "share":
      return <Share2 className="h-8 w-8 text-purple-600" />;
    case "limit_reached":
      return <FileText className="h-8 w-8 text-orange-600" />;
    case "premium_feature":
      return <Sparkles className="h-8 w-8 text-yellow-600" />;
    default:
      return null;
  }
};

export default function AuthModal() {
  const { isOpen, type: mode, trigger, close } = useAuthModalStore();

  if (!isOpen) return null;

  const icon = getTriggerIcon(trigger);
  const message = getTriggerMessage(trigger, mode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>

          <div className="flex justify-center mb-4">
            <Logo />
          </div>

          {icon && <div className="flex justify-center mb-3">{icon}</div>}

          <h2 className="text-center font-headline text-2xl lg:text-3xl mb-2">
            {mode === "login" ? "Welcome Back" : "Continue Your Work"}
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {message}
          </p>

          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
}
