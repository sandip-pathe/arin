// components/session/RightPanel.tsx
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash } from "react-icons/fa6";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { FiSliders } from "react-icons/fi";
import { IoChatbox } from "react-icons/io5";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatWindow } from "@/components/follow-up-chat";
import { SkeletonBox } from "@/components/Skeleton";
import CitationView from "@/components/source-viewer";
import useSessionStore from "@/store/session-store";

interface RightPanelProps {
  activeRightPanel: "chat" | "citation" | "closed";
  currentSourceId: string | null;
  sessionId: string;
  onClose: () => void;
  onToggleChat: () => void;
  onCitationClick: (id: string) => void;
  onDeleteChats: () => void;
}

export const RightPanel = ({
  activeRightPanel,
  currentSourceId,
  sessionId,
  onClose,
  onToggleChat,
  onDeleteChats,
}: RightPanelProps) => {
  const {
    loadingStates,
    chatMessages,
    setChatMessages,
    setIsChatCollapsed,
    summaries,
    paragraphs,
    setShowChatSettingsModal,
  } = useSessionStore();

  if (activeRightPanel !== "closed") {
    return (
      <motion.aside
        key="right-panel-open"
        transition={{ duration: 0.2 }}
        className={`border-none bg-white rounded-lg mx-4 mb-4 flex flex-col w-1/3`}
      >
        {activeRightPanel === "chat" ? (
          <>
            <div className="z-10 border-b flex items-center justify-between">
              <div className="flex items-center justify-start gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BsLayoutSidebarInsetReverse
                    className="cursor-pointer m-2 text-gray-600"
                    size={24}
                    onClick={onClose}
                  />
                </motion.div>
                <div className="p-4 font-medium">Chat</div>
              </div>
              <div className="flex items-center justify-start">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <FaTrash
                        size={18}
                        className="text-gray-600 hover:text-red-600 m-2"
                      />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chats</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your conversation?
                          This action cannot be undone.{" "}
                          <span className="hover:underline cursor-pointer text-blue-600">
                            Read our data policy
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={onDeleteChats}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSliders
                    size={18}
                    className="m-2 text-gray-600 cursor-pointer hover:text-black"
                    onClick={() => setShowChatSettingsModal(true)}
                  />
                </motion.div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              {loadingStates.session ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 space-y-3"
                >
                  <SkeletonBox className="h-4 w-3/4" />
                  <SkeletonBox className="h-4 w-1/2" />
                  <SkeletonBox className="h-32 w-full mt-4" />
                  <SkeletonBox className="h-8 w-full mt-4" />
                </motion.div>
              ) : (
                <motion.div
                  className="p-4 flex flex-col h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <ChatWindow
                    chatMessages={chatMessages}
                    setChatMessages={setChatMessages}
                    setIsChatCollapsed={setIsChatCollapsed}
                    key={sessionId}
                    sessionId={sessionId}
                    summary={summaries}
                  />
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <CitationView
            sourceId={currentSourceId}
            paragraphs={paragraphs}
            onClose={onClose}
            title={summaries?.title || "Sources"}
          />
        )}
      </motion.aside>
    );
  }

  return (
    <motion.aside
      key="right-panel-closed"
      transition={{ duration: 0.2 }}
      className="w-14 border-none bg-white rounded-lg mx-4 mb-4 flex flex-col"
    >
      <div className="z-10 border-b flex items-center py-2 justify-center">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <IoChatbox
            className="cursor-pointer m-2 text-gray-600"
            size={24}
            onClick={onToggleChat}
          />
        </motion.div>
      </div>
      <div className="flex-1 overflow-auto p-4"> </div>
    </motion.aside>
  );
};
