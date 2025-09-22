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
        className="flex items-center text-gray-500 justify-center rounded-xl border-none hover:bg-blue-100 py-1 px-3"
        onClick={() => {
          setIsDemoSession(true);
          onUseSampleDoc?.();
          onDismiss?.();
        }}
      >
        <span className="ml-1 hover:text-blue-600">Try Sample Document!</span>
      </button>
    </>
  );
}
