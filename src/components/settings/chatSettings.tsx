"use client";

import { useState } from "react";
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
import { FiSend } from "react-icons/fi";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

export const ChatSettings = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { updateSettings } = useAuth();
  const [conversationStyle, setConversationStyle] = useState<
    "precise" | "balanced" | "creative"
  >("balanced");
  const [responseLength, setResponseLength] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [autoSuggestions, setAutoSuggestions] = useState(true);

  const handleSave = () => {
    updateSettings({
      chat: {
        conversationStyle,
        responseLength,
        autoSuggestions,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">
        Welcome to Legal AI Assistant
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none rounded-3xl border-none overflow-hidden">
        <div className="relative bg-white rounded-3xl shadow-lg h-full p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Chat Settings
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pt-2">
                  <Label>Auto Suggestions</Label>
                  <Switch
                    checked={autoSuggestions}
                    onCheckedChange={setAutoSuggestions}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conversation Style</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        conversationStyle === "precise" ? "default" : "outline"
                      }
                      onClick={() => setConversationStyle("precise")}
                    >
                      Precise & Factual
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        conversationStyle === "balanced" ? "default" : "outline"
                      }
                      onClick={() => setConversationStyle("balanced")}
                    >
                      Balanced
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        conversationStyle === "creative" ? "default" : "outline"
                      }
                      onClick={() => setConversationStyle("creative")}
                    >
                      Creative & Engaging
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Response Length</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        responseLength === "short" ? "default" : "outline"
                      }
                      onClick={() => setResponseLength("short")}
                    >
                      Short
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        responseLength === "medium" ? "default" : "outline"
                      }
                      onClick={() => setResponseLength("medium")}
                    >
                      Medium
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        responseLength === "long" ? "default" : "outline"
                      }
                      onClick={() => setResponseLength("long")}
                    >
                      Long
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  <FiSend className="mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
