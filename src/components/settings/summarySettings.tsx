// SummarySettings.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export const SummarySettings = ({ onClose }: { onClose?: () => void }) => {
  const { settings, updateSettings } = useAuthStore();
  const [summaryLength, setSummaryLength] = useState(settings.summary.length);
  const [complexity, setComplexity] = useState(settings.summary.complexity);
  const [tone, setTone] = useState(settings.summary.tone);
  const [style, setStyle] = useState(settings.summary.style);
  const [saving, setSaving] = useState(false);

  const lengthOptions = [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
    { value: "long", label: "Long" },
  ];
  const complexityOptions = [
    { value: "simple", label: "Simple Language" },
    { value: "balanced", label: "Balanced" },
    { value: "advanced", label: "Advanced Terminology" },
  ];
  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "medium", label: "Formal" },
    { value: "long", label: "Casual" },
  ];

  const styleOptions = [
    { value: "detailed", label: "Detailed" },
    { value: "concise", label: "Concise" },
    { value: "narrative", label: "Narrative" },
  ];

  useEffect(() => {
    setSummaryLength(settings.summary.length);
    setComplexity(settings.summary.complexity);
    setTone(settings.summary.tone);
    setStyle(settings.summary.style);
  }, [settings]);

  const hasChanges = useMemo(() => {
    return (
      summaryLength !== settings.summary.length ||
      complexity !== settings.summary.complexity ||
      tone !== settings.summary.tone ||
      style !== settings.summary.style
    );
  }, [summaryLength, complexity, tone, style, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    await updateSettings({
      summary: {
        length: summaryLength,
        complexity,
        tone,
        style,
      },
    });
    setSaving(false);
    onClose?.();
  };

  return (
    <Card className="border-none shadow-none bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Summary Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Summary Length</Label>
          <div className="flex gap-2">
            {lengthOptions.map((option) => (
              <Button
                key={option.value}
                variant={summaryLength === option.value ? "default" : "outline"}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors",
                  summaryLength === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                )}
                onClick={() => setSummaryLength(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Complexity</Label>
          <div className="flex flex-wrap gap-2">
            {complexityOptions.map((option) => (
              <Button
                key={option.value}
                variant={complexity === option.value ? "default" : "outline"}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors",
                  complexity === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                )}
                onClick={() => setComplexity(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2"></div>
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <div className="flex gap-2">
            {toneOptions.map((option) => (
              <Button
                key={option.value}
                variant={tone === option.value ? "default" : "outline"}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors",
                  tone === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                )}
                onClick={() => setTone(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <div className="flex gap-2">
            {styleOptions.map((option) => (
              <Button
                key={option.value}
                variant={style === option.value ? "default" : "outline"}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors",
                  style === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                )}
                onClick={() => setStyle(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          aria-label="Save summary settings"
        >
          <FiSend className="mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const SummarySettingsModal = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="text-lg font-semibold sr-only">
        Summary Settings
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none rounded-3xl border-none overflow-hidden">
        <SummarySettings onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
