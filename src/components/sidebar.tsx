"use client";

import { FiShare2, FiSettings, FiHome } from "react-icons/fi";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/session-store";
import { AccountSettingsModal } from "./settings/accountSettings";
import { ShareModal } from "./settings/sharing";
import { Membership } from "./settings/membership";
import { UnifiedSettingsModal } from "./settings/settings";
import { useAuthStore } from "@/store/auth-store";

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isCollapsed?: boolean;
}

export const Sidebar = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const { user, membership } = useAuthStore();
  const {
    showAccountModal,
    setShowAccountModal,
    showMembershipModal,
    setShowMembershipModal,
    showShareModal,
    setShowShareModal,
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
      className={`flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-100 transition group ${
        isCollapsed ? "justify-center" : "justify-start"
      }`}
    >
      <div className="text-gray-600 group-hover:text-blue-600">{icon}</div>
      {!isCollapsed && (
        <span className="ml-3 text-sm font-medium text-gray-800">{label}</span>
      )}
    </button>
  );
  return (
    <>
      <aside
        className={`${
          isSidebarOpen ? "w-60" : "w-14"
        } border-none bg-white rounded-lg select-none mx-4 mb-4 flex flex-col shadow transition-all duration-200`}
      >
        {/* Header */}
        <div className="z-10 border-b flex items-center justify-between px-2 py-2">
          {isSidebarOpen ? (
            <>
              <span className="text-sm font-semibold px-2">Menu</span>
              <BsLayoutSidebarInset
                className="cursor-pointer m-2"
                size={24}
                onClick={toggleSidebar}
              />
            </>
          ) : (
            <BsLayoutSidebarInset
              className="cursor-pointer mx-auto m-2"
              size={24}
              onClick={toggleSidebar}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto space-y-2">
          <div className="flex flex-col justify-between h-full">
            {/* Buttons */}
            <div className="flex flex-col p-2 space-y-3 mt-4">
              <SidebarButton
                icon={<FiHome size={20} />}
                label="Home"
                onClick={() => router.push("/")}
                isCollapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<FiShare2 size={20} />}
                label="Share"
                onClick={() => setShowShareModal(true)}
                isCollapsed={!isSidebarOpen}
              />
              <SidebarButton
                icon={<FiSettings size={20} />}
                label="Settings"
                onClick={() => setShowSettingsModal(true)}
                isCollapsed={!isSidebarOpen}
              />
            </div>

            {/* User Section */}
            <div
              className={`border-t mt-4 pt-3 ${
                isSidebarOpen
                  ? "px-2 flex items-center gap-2"
                  : "flex justify-center"
              } cursor-pointer hover:bg-gray-100 rounded-lg p-2`}
              onClick={() => setShowAccountModal(true)}
            >
              <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
                <AvatarFallback>
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="text-xs">
                  <div className="font-semibold">{user?.displayName}</div>
                  <div className="text-[11px] text-blue-500">
                    {membership.type === "trial"
                      ? `Free (${membership.endDate})`
                      : membership.type === "pro"
                      ? `Pro (ends ${membership.endDate})`
                      : "Pro Member"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      <AccountSettingsModal
        isOpen={showAccountModal}
        isOpenChange={setShowAccountModal}
      />
      <ShareModal
        isOpen={showShareModal}
        onOpenChange={setShowShareModal}
        sessionId={sessionId}
      />
      <Membership
        isOpen={showMembershipModal}
        onOpenChange={setShowMembershipModal}
      />
      <UnifiedSettingsModal
        isOpen={showSettingsModal}
        isOpenChange={setShowSettingsModal}
      />
    </>
  );
};
