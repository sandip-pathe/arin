"use client";

import { FiDownload, FiSettings, FiHome, FiX, FiLock } from "react-icons/fi";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/session-store";
import { LocalExportModal } from "./settings/local-export";
import { UnifiedSettingsModal } from "./settings/settings";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isCollapsed?: boolean;
}

export const Sidebar = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const {
    showExportModal,
    setShowExportModal,
    showSettingsModal,
    setShowSettingsModal,
  } = useSessionStore();

  const SidebarButton = ({
    icon,
    label,
    onClick,
    isCollapsed = false,
  }: SidebarButtonProps) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 transition group ${
        isCollapsed ? "justify-center" : "justify-start"
      }`}
    >
      <div className="text-gray-600 group-hover:text-blue-600 text-lg sm:text-xl">
        {icon}
      </div>
      {!isCollapsed && (
        <span className="ml-2 sm:ml-3 text-sm font-medium text-gray-800">
          {label}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block ${
          isSidebarOpen ? "w-48 lg:w-60" : "w-12 lg:w-14"
        } border-none bg-white rounded-lg select-none mx-2 sm:mx-4 mb-4 flex flex-col shadow transition-all duration-200`}
      >
        {/* Header */}
        <div className="z-10 border-b flex items-center justify-between px-2 py-2">
          {isSidebarOpen ? (
            <>
              <span className="text-sm font-semibold px-1 sm:px-2">Menu</span>
              <BsLayoutSidebarInset
                className="cursor-pointer m-1 sm:m-2"
                size={20}
                onClick={toggleSidebar}
              />
            </>
          ) : (
            <BsLayoutSidebarInset
              className="cursor-pointer mx-auto m-1 sm:m-2"
              size={20}
              onClick={toggleSidebar}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto space-y-1 sm:space-y-2">
          <div className="flex flex-col justify-between h-full">
            {/* Buttons */}
            <div className="flex flex-col p-1 sm:p-2 space-y-2 sm:space-y-3 mt-2 sm:mt-4">
              <SidebarButton
                icon={<FiHome size={18} />}
                label="Home"
                onClick={() => router.push("/")}
                isCollapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<FiDownload size={18} />}
                label="Export"
                onClick={() => setShowExportModal(true)}
                isCollapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<FiSettings size={18} />}
                label="Settings"
                onClick={() => setShowSettingsModal(true)}
                isCollapsed={!isSidebarOpen}
              />
            </div>

            {/* Local status */}
            <div
              className={`border-t mt-2 sm:mt-4 pt-2 sm:pt-3 ${
                isSidebarOpen
                  ? "px-1 sm:px-2 flex items-center gap-1 sm:gap-2"
                  : "flex justify-center"
              } rounded-lg p-1 sm:p-2`}
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm">
                <FiLock size={14} />
              </div>
              {isSidebarOpen && (
                <div className="text-xs">
                  <div className="font-semibold">Local Workspace</div>
                  <div className="text-[10px] sm:text-[11px] text-emerald-600">
                    Stored in this browser
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-white shadow-xl lg:hidden flex flex-col"
      >
        {/* Header */}
        <div className="z-10 border-b flex items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold">Menu</span>
          <FiX className="cursor-pointer" size={20} onClick={toggleSidebar} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto space-y-2">
          <div className="flex flex-col justify-between h-full">
            {/* Buttons */}
            <div className="flex flex-col p-4 space-y-4 mt-4">
              <SidebarButton
                icon={<FiHome size={20} />}
                label="Home"
                onClick={() => {
                  router.push("/");
                  toggleSidebar();
                }}
                isCollapsed={false}
              />
              <SidebarButton
                icon={<FiDownload size={20} />}
                label="Export"
                onClick={() => {
                  setShowExportModal(true);
                  toggleSidebar();
                }}
                isCollapsed={false}
              />
              <SidebarButton
                icon={<FiSettings size={20} />}
                label="Settings"
                onClick={() => {
                  setShowSettingsModal(true);
                  toggleSidebar();
                }}
                isCollapsed={false}
              />
            </div>

            {/* Local status */}
            <div
              className="border-t mt-4 pt-4 px-4 flex items-center gap-3 rounded-lg p-3"
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm">
                <FiLock size={16} />
              </div>
              <div className="text-sm">
                <div className="font-semibold">Local Workspace</div>
                <div className="text-xs text-emerald-600">
                  Stored in this browser
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      <LocalExportModal
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        sessionId={sessionId}
      />
      <UnifiedSettingsModal
        isOpen={showSettingsModal}
        isOpenChange={setShowSettingsModal}
      />
    </>
  );
};
