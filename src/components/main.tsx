// components/session/MainContent.tsx
import { motion } from "framer-motion";
import { SkeletonBox } from "@/components/Skeleton";
import { ThinkingLoader } from "@/components/ProgressStepper";
import SummaryDisplay from "@/components/summaryDisplay";
import { useAuthStore } from "@/store/auth-store";
import useSessionStore from "@/store/session-store";

interface MainContentProps {
  isSummarizing: boolean;
  paragraphCount: number;
  onCitationClick: (id: string) => void;
  isSharedWithUser: boolean;
}

export const MainContent = ({
  isSummarizing,
  paragraphCount,
  onCitationClick,
}: MainContentProps) => {
  const {
    loadingStates,
    activeSession,
    summaries,
    paragraphs,
    setShowWelcomeModal,
  } = useSessionStore();
  const { user } = useAuthStore();

  if (loadingStates.session || !user) {
    return (
      <motion.div
        key="session-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4 p-6 max-w-3xl mx-auto"
      >
        <SkeletonBox className="h-8 w-3/4" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-5/6" />
        <SkeletonBox className="h-8 w-1/2 mt-8" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-full" />
      </motion.div>
    );
  }

  if (isSummarizing) {
    return (
      <motion.div
        key="summarizing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-6"
      >
        <ThinkingLoader
          isSummarizing={isSummarizing}
          paragraphsCount={paragraphCount}
        />
      </motion.div>
    );
  }

  if (summaries) {
    return (
      <motion.div
        key="summary-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6"
      >
        <SummaryDisplay
          paragraphs={paragraphs}
          summary={summaries}
          onCitationClick={onCitationClick}
        />
      </motion.div>
    );
  }

  if (
    user?.uid === activeSession?.userId &&
    activeSession?.noOfAttachments === 0
  ) {
    return (
      <motion.div
        key="no-summary-owner"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-8"
      >
        <div className="text-gray-500 mb-4">
          No summary yet. Add your documents to get started.
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWelcomeModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Get Started
        </motion.button>
      </motion.div>
    );
  }

  return null;
};
