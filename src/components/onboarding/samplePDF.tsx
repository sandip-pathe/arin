import { FileText } from "lucide-react";
import useSessionStore from "@/store/session-store";

interface OnboardingSamplePdfProps {
  onUseSampleDoc?: () => void;
  onDismiss?: () => void;
}

export default function OnboardingSamplePdf({
  onUseSampleDoc,
  onDismiss,
}: OnboardingSamplePdfProps) {
  const { setIsDemoSession } = useSessionStore();
  return (
    <>
      <button
        className="flex items-center text-gray-500 justify-center rounded-xl border-none hover:bg-gray-100"
        onClick={() => {
          setIsDemoSession(true);
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
