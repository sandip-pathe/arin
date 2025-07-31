"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FiSend } from "react-icons/fi";
import { useAuth } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

export const SummarySettings = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { settings, updateSettings } = useAuth();

  const [summaryLength, setSummaryLength] = useState(settings.summary.length);
  const [complexity, setComplexity] = useState(settings.summary.complexity);
  const [tone, setTone] = useState(settings.summary.tone);
  const [style, setStyle] = useState(settings.summary.style);

  const handleSave = () => {
    updateSettings({
      summary: {
        length: summaryLength,
        complexity,
        tone,
        style,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="text-lg font-semibold sr-only">
        Summary Settings
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none rounded-3xl border-none overflow-hidden">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Summary Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Summary Length</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={summaryLength === "short" ? "default" : "outline"}
                  onClick={() => setSummaryLength("short")}
                >
                  Short
                </Button>
                <Button
                  size="sm"
                  variant={summaryLength === "medium" ? "default" : "outline"}
                  onClick={() => setSummaryLength("medium")}
                >
                  Medium
                </Button>
                <Button
                  size="sm"
                  variant={summaryLength === "long" ? "default" : "outline"}
                  onClick={() => setSummaryLength("long")}
                >
                  Long
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Complexity</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={complexity === "simple" ? "default" : "outline"}
                  onClick={() => setComplexity("simple")}
                >
                  Simple Language
                </Button>
                <Button
                  size="sm"
                  variant={complexity === "balanced" ? "default" : "outline"}
                  onClick={() => setComplexity("balanced")}
                >
                  Balanced
                </Button>
                <Button
                  size="sm"
                  variant={complexity === "advanced" ? "default" : "outline"}
                  onClick={() => setComplexity("advanced")}
                >
                  Advanced Terminology
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={tone === "professional" ? "default" : "outline"}
                  onClick={() => setTone("professional")}
                >
                  Professional
                </Button>
                <Button
                  size="sm"
                  variant={tone === "medium" ? "default" : "outline"}
                  onClick={() => setTone("medium")}
                >
                  Formal
                </Button>
                <Button
                  size="sm"
                  variant={tone === "long" ? "default" : "outline"}
                  onClick={() => setTone("long")}
                >
                  Casual
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Style</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={style === "concise" ? "default" : "outline"}
                  onClick={() => setStyle("concise")}
                >
                  Concise
                </Button>
                <Button
                  size="sm"
                  variant={style === "detailed" ? "default" : "outline"}
                  onClick={() => setStyle("detailed")}
                >
                  Detailed
                </Button>
                <Button
                  size="sm"
                  variant={style === "bullet" ? "default" : "outline"}
                  onClick={() => setStyle("bullet")}
                >
                  Bullet Points
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
      </DialogContent>
    </Dialog>
  );
};
