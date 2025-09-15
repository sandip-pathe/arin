import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";

interface OnboardingSamplePdfProps {
  onUseSampleDoc?: () => void;
  onDismiss?: () => void;
}

export default function OnboardingSamplePdf({
  onUseSampleDoc,
  onDismiss,
}: OnboardingSamplePdfProps) {
  return (
    <>
      <button
        className="flex items-center text-gray-500 justify-center rounded-xl border-none hover:bg-gray-100"
        onClick={() => {
          onUseSampleDoc?.();
          onDismiss?.();
        }}
      >
        <FileText className="h-5 w-5" />
        <span className="ml-1">sample.pdf</span>
      </button>
    </>
  );
}
