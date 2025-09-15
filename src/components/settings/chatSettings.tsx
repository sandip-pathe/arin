// ChatSettings.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FiSend } from "react-icons/fi";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export const ChatSettings = ({ onClose }: { onClose?: () => void }) => {
  const { settings, updateSettings } = useAuthStore();

  const [conversationStyle, setConversationStyle] = useState(
    settings.chat.conversationStyle
  );
  const [responseLength, setResponseLength] = useState(
    settings.chat.responseLength
  );
  const [autoSuggestions, setAutoSuggestions] = useState(
    settings.chat.autoSuggestions
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConversationStyle(
      ["precise", "balanced", "creative"].includes(
        settings.chat.conversationStyle
      )
        ? (settings.chat.conversationStyle as
            | "precise"
            | "balanced"
            | "creative")
        : "balanced"
    );
    setResponseLength(
      ["short", "medium", "long"].includes(settings.chat.responseLength)
        ? (settings.chat.responseLength as "short" | "medium" | "long")
        : "medium"
    );
    setAutoSuggestions(!!settings.chat.autoSuggestions);
  }, [settings]);

  const hasChanges = useMemo(() => {
    return (
      conversationStyle !== settings.chat.conversationStyle ||
      responseLength !== settings.chat.responseLength ||
      autoSuggestions !== settings.chat.autoSuggestions
    );
  }, [conversationStyle, responseLength, autoSuggestions, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    await updateSettings({
      chat: {
        conversationStyle,
        responseLength,
        autoSuggestions,
      },
    });
    setSaving(false);
    onClose?.();
  };

  const conversationStyleOptions = [
    { value: "precise", label: "Precise & Factual" },
    { value: "balanced", label: "Balanced" },
    { value: "creative", label: "Creative & Engaging" },
  ];

  const responseLengthOptions = [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
    { value: "long", label: "Long" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Conversation Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <Label>Auto Suggestions</Label>
            <Switch
              checked={autoSuggestions}
              onCheckedChange={setAutoSuggestions}
            />
          </div>

          <div className="space-y-2">
            <Label>Conversation Style</Label>
            <div className="flex gap-2">
              {conversationStyleOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    conversationStyle === option.value ? "default" : "outline"
                  }
                  className={cn(
                    "rounded-full px-4 py-2 transition-colors",
                    conversationStyle === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                  )}
                  onClick={() => setConversationStyle(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Response Length</Label>
            <div className="flex gap-2">
              {responseLengthOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    responseLength === option.value ? "default" : "outline"
                  }
                  className={cn(
                    "rounded-full px-4 py-2 transition-colors",
                    responseLength === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                  )}
                  onClick={() => setResponseLength(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <FiSend className="mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export const ChatSettingsModal = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Conversation Settings</DialogTitle>
      <DialogContent className="w-full h-full max-w-none max-h-none rounded-none md:max-w-4xl md:h-[90dvh] md:rounded-3xl p-0 bg-transparent shadow-none border-none overflow-hidden">
        <div className="relative bg-white md:rounded-3xl shadow-lg h-full p-4 md:p-8 overflow-y-auto">
          <ChatSettings onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
