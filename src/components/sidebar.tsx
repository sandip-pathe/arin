"use client";

import { FiShare2, FiSettings, FiHome, FiChevronDown } from "react-icons/fi";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/session-store";

export const Sidebar = () => {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSessionStore();
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const mockUser = {
    name: "Sandeep",
    membership: "Pro",
  };

  const SidebarButton = ({
    icon,
    label,
    onClick,
    isDropdown = false,
    open,
  }: {
    icon: JSX.Element;
    label: string;
    onClick?: () => void;
    isDropdown?: boolean;
    open?: boolean;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {isDropdown && (
        <FiChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      )}
    </button>
  );

  const DropdownItem = ({ label }: { label: string }) => (
    <div className="text-xs px-4 py-1 text-gray-600 hover:text-black z-50 hover:bg-gray-100 rounded">
      {label}
    </div>
  );

  return (
    <aside
      className={`${
        isSidebarOpen ? "w-60" : "w-14"
      } border-none bg-white rounded-lg select-none mx-4 mb-4 flex flex-col shadow transition-all duration-200`}
    >
      {/* Header */}
      <div className="z-10 border-b flex items-center justify-between px-2 py-3">
        {isSidebarOpen ? (
          <>
            <span className="text-sm font-semibold px-2">Menu</span>
            <BsLayoutSidebarInset
              className="cursor-pointer"
              size={20}
              onClick={toggleSidebar}
            />
          </>
        ) : (
          <BsLayoutSidebarInset
            className="cursor-pointer mx-auto"
            size={20}
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {isSidebarOpen ? (
          <div className="flex flex-col space-y-1 justify-between h-full">
            {/* Share */}
            <div className="relative">
              {/* Home */}
              <SidebarButton
                icon={<FiHome size={18} />}
                label="Home"
                onClick={() => router.push("/")}
              />
              <SidebarButton
                icon={<FiShare2 size={18} />}
                label="Share"
                onClick={() => setShowShare(!showShare)}
                isDropdown
                open={showShare}
              />
              {showShare && (
                <div className="ml-8 space-y-1 z-20 relative">
                  <DropdownItem label="With Source Files" />
                  <DropdownItem label="Without Source Files" />
                </div>
              )}

              {/* Settings */}
              <SidebarButton
                icon={<FiSettings size={18} />}
                label="Settings"
                onClick={() => setShowSettings(!showSettings)}
                isDropdown
                open={showSettings}
              />

              {showSettings && (
                <div className="ml-8 space-y-1 z-20 relative">
                  <DropdownItem label="Light Mode" />
                  <DropdownItem label="Subscription" />
                  <DropdownItem label="Privacy & Policy" />
                  <DropdownItem label="Feedback" />
                  <DropdownItem label="Suggestions" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="border-t mt-4 pt-3 px-2 flex items-center gap-2">
              <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <div className="font-semibold">{mockUser.name}</div>
                <div className="text-[11px] text-blue-500">
                  {mockUser.membership}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 justify-between h-full">
            {/* Logo */}
            {/* Icon-only dropdowns */}
            <div className="flex flex-col items-center space-y-4 mt-4">
              <FiHome className="mx-auto cursor-pointer" size={18} />
              <div className="relative group">
                <FiShare2 className="mx-auto cursor-pointer" size={18} />
                <div className="absolute left-full top-0 ml-2 w-48 p-2 rounded bg-white shadow hidden group-hover:block z-20">
                  <DropdownItem label="With Source Files" />
                  <DropdownItem label="Without Source Files" />
                </div>
              </div>

              <div className="relative group">
                <FiSettings className="mx-auto cursor-pointer" size={18} />
                <div className="absolute left-full top-0 ml-2 w-48 p-2 rounded bg-white shadow hidden group-hover:block z-20">
                  <DropdownItem label="Light Mode" />
                  <DropdownItem label="Subscription" />
                  <DropdownItem label="Privacy & Policy" />
                  <DropdownItem label="Feedback" />
                  <DropdownItem label="Suggestions" />
                </div>
              </div>
            </div>

            <div className="relative group mt-4">
              <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
