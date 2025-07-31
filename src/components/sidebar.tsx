"use client";

import { FiShare2, FiSettings, FiHome } from "react-icons/fi";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/session-store";
import { useAuth } from "@/contexts/auth-context";
import { AccountSettings } from "./settings/accountSettings";
import { ShareModal } from "./settings/sharing";
import { MembershipSettings } from "./settings/membershipSettings";

export const Sidebar = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const { user, membership } = useAuth();
  const {
    showAccountModal,
    setShowAccountModal,
    showMembershipModal,
    setShowMembershipModal,
    showShareModal,
    setShowShareModal,
  } = useSessionStore();

  const SidebarButton = ({
    icon,
    label,
    onClick,
  }: {
    icon: JSX.Element;
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </button>
  );

  return (
    <>
      <AccountSettings
        isOpen={showAccountModal}
        isOpenChange={setShowAccountModal}
      />
      <ShareModal
        isOpen={showShareModal}
        onOpenChange={setShowShareModal}
        sessionId={sessionId}
      />
      <MembershipSettings
        isOpen={showMembershipModal}
        onOpenChange={setShowMembershipModal}
      />

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
        <div className="flex-1 overflow-auto p-2 space-y-2">
          {isSidebarOpen ? (
            <div className="flex flex-col space-y-1 justify-between h-full">
              {/* Main Buttons */}
              <div className="space-y-1">
                <SidebarButton
                  icon={<FiHome size={18} />}
                  label="Home"
                  onClick={() => router.push("/")}
                />
                <SidebarButton
                  icon={<FiShare2 size={18} />}
                  label="Share"
                  onClick={() => setShowShareModal(true)}
                />
                <SidebarButton
                  icon={<FiSettings size={18} />}
                  label="Settings"
                  onClick={() => {}}
                />
                {membership.type === "trial" && (
                  <div className="gap-2">
                    <button
                      onClick={() => setShowMembershipModal(true)}
                      className="flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition text-white text-sm font-semibold shadow w-full"
                    >
                      <span>✨ Upgrade to Pro</span>
                      <span className="bg-white text-orange-500 text-xs px-2 py-1 rounded ml-2">
                        50% OFF
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div
                className="border-t mt-4 pt-3 px-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2"
                onClick={() => setShowAccountModal(true)}
              >
                <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
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
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 justify-between h-full">
              {/* Icons */}
              <div className="flex flex-col items-center space-y-6 mt-4">
                <FiHome
                  className="mx-auto cursor-pointer hover:text-blue-600 transition"
                  size={20}
                  onClick={() => router.push("/")}
                />
                <FiShare2
                  className="mx-auto cursor-pointer hover:text-blue-600 transition"
                  size={20}
                  onClick={() => setShowShareModal(true)}
                />
                <FiSettings
                  className="mx-auto cursor-pointer hover:text-blue-600 transition"
                  size={20}
                  onClick={() => {}}
                />
                {membership.type === "trial" && (
                  <div className="items-center gap-2">
                    <button
                      onClick={() => setShowMembershipModal(true)}
                      className="flex items-center justify-center text-white text-sm font-semibold shadow w-full"
                    >
                      <span className="text-white text-xs px-2 py-1 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition">
                        40% OFF
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div
                className="relative group mt-4 cursor-pointer"
                onClick={() => setShowAccountModal(true)}
              >
                <Avatar className="border-blue-600 border-2 shadow-sm">
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {membership.type === "trial" && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center">
                    {membership.endDate
                      ? Math.max(
                          0,
                          Math.floor(
                            (Date.now() -
                              Date.parse(String(membership.endDate))) /
                              (1000 * 60 * 60 * 24)
                          )
                        )
                      : ""}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
