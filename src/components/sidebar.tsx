"use client";

import { FiShare2, FiSettings, FiHome, FiX } from "react-icons/fi";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/session-store";
import { motion } from "framer-motion";
import { AccountSettings, MembershipSettings } from "./sidebar-modals";
import { FaGavel } from "react-icons/fa6";
import { ShareModal } from "./share-modal";

export const Sidebar = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const [modalType, setModalType] = useState<
    "share" | "settings" | "account" | null
  >(null);

  const mockUser = {
    name: "Sandeep",
    email: "sandeep@example.com",
    membershipType: "free", // free | pro | trial
    remainingSessions: 3,
    trialEndDate: "2025-08-24",
  };

  const closeModal = () => setModalType(null);

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
      {/* Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-none p-12 max-w-4xl h-[90dvh] shadow-none relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-6 text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-100"
            >
              <FiX size={24} />
            </button>

            <div
              className="overflow-y-auto h-full"
              style={{
                scrollbarWidth: "none",
                scrollbarColor: "#213555 #f3f4f6",
              }}
            >
              {modalType === "share" && <ShareModal sessionId={sessionId} />}
              {modalType === "settings" && <MembershipSettings />}
              {modalType === "account" && <AccountSettings />}
            </div>
          </motion.div>
        </div>
      )}

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
                  onClick={() => setModalType("share")}
                />
                <SidebarButton
                  icon={<FiSettings size={18} />}
                  label="Settings"
                  onClick={() => setModalType("settings")}
                />
              </div>

              <div
                onClick={() => setModalType("settings")}
                className="flex flex-row cursor-pointer items-center justify-center border rounded-sm px-1 w-full"
              >
                <span className="text-gray-600 text-sm">Mock</span>
                <span className="text-gray-600 text-md mx-2">Trial</span>
                <FaGavel className="text-gray-600 cursor-pointer hover:text-black" />
              </div>

              {/* Subscribe Button */}
              {mockUser.membershipType === "free" && (
                <div className="px-2 items-center gap-2">
                  <button
                    onClick={() => setModalType("account")}
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition text-white text-sm font-semibold shadow w-full"
                  >
                    <span>✨ Upgrade to Pro</span>
                    <span className="bg-white text-orange-500 text-xs px-2 py-1 rounded ml-2">
                      50% OFF
                    </span>
                  </button>
                </div>
              )}

              {/* User Info */}
              <div
                className="border-t mt-4 pt-3 px-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2"
                onClick={() => setModalType("account")}
              >
                <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
                  <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <div className="font-semibold">{mockUser.name}</div>
                  <div className="text-[11px] text-blue-500">
                    {mockUser.membershipType === "free"
                      ? `Free (${mockUser.remainingSessions}/5 sessions)`
                      : mockUser.membershipType === "trial"
                      ? `Trial (ends ${mockUser.trialEndDate})`
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
                  onClick={() => setModalType("share")}
                />
                <FiSettings
                  className="mx-auto cursor-pointer hover:text-blue-600 transition"
                  size={20}
                  onClick={() => setModalType("settings")}
                />
                <div
                  onClick={() => setModalType("settings")}
                  className="flex flex-col cursor-pointer items-center justify-center m-2 border rounded-sm px-1"
                >
                  <span className="text-gray-600 text-xs">Mock</span>
                  <span className="text-gray-600 text-sm">Trail</span>
                  {/* <FaGavel className="text-gray-600 cursor-pointer hover:text-black" /> */}
                </div>
                {mockUser.membershipType === "free" && (
                  <div className="px-2 flex items-center gap-2">
                    <button
                      onClick={() => setModalType("account")}
                      className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition text-white text-sm font-semibold shadow w-full"
                    >
                      <span className="bg-white text-blue-900 text-xs px-2 py-1 rounded-md">
                        40% OFF
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div
                className="relative group mt-4 cursor-pointer"
                onClick={() => setModalType("account")}
              >
                <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
                  <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {mockUser.membershipType === "free" && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center">
                    {mockUser.remainingSessions}
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
