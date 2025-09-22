// components/session/MainContent.tsx
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonBox } from "@/components/Skeleton";
import { ThinkingLoader } from "@/components/ProgressStepper";
import SummaryDisplay from "@/components/summaryDisplay";
import InstantSkimDisplay from "./instant-skim";
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
    quickSummary,
    setShowWelcomeModal,
    isDemoSession,
  } = useSessionStore();

  const canShowEmptyState =
    !summaries &&
    !isSummarizing &&
    !isDemoSession &&
    activeSession?.noOfAttachments === 0;

  // --- Skeleton while session metadata is loading ---
  if (loadingStates.session || !activeSession) {
    return (
      <motion.div
        key="session-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4 p-6 max-w-3xl mx-auto"
      >
        <SkeletonBox className="h-7 w-3/5 rounded-md" />
        <SkeletonBox className="h-5 w-full rounded-md" />
        <SkeletonBox className="h-5 w-5/6 rounded-md" />
        <SkeletonBox className="h-6 w-1/3 mt-6 rounded-md" />
        <SkeletonBox className="h-5 w-4/5 rounded-md" />
        <SkeletonBox className="h-5 w-full rounded-md" />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="main-content"
      className="flex flex-col space-y-6 p-4 sm:p-6 max-w-3xl mx-auto"
    >
      {/* --- Instant Skim (always show if exists) --- */}
      <AnimatePresence>
        {quickSummary && (
          <motion.div
            key="instant-skim"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InstantSkimDisplay skimText={quickSummary} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Loader for full summary --- */}
      <AnimatePresence>
        {isSummarizing && (
          <motion.div
            key="summarizing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ThinkingLoader
              isSummarizing={isSummarizing}
              paragraphsCount={paragraphCount}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Final Summary --- */}
      <AnimatePresence>
        {summaries && !isSummarizing && (
          <motion.div
            key="summary-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SummaryDisplay
              paragraphs={paragraphs}
              summary={summaries}
              onCitationClick={onCitationClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Empty State (after delay) --- */}
      <AnimatePresence>
        {canShowEmptyState && (
          <motion.div
            key="no-summary-owner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8"
          >
            <div className="text-gray-500 mb-4 text-sm sm:text-base">
              No summary yet. Add your documents to get started.
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWelcomeModal(true)}
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-md text-sm sm:text-base"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
