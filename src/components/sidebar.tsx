import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MessageSquare,
  PlusCircle,
  Search,
  History,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VscThreeBars } from "react-icons/vsc";
import Logo from "./logo";
import { UserProfile } from "./user-profile";
import { SidebarItem, SidebarProps } from "@/types/page";

const iconBaseClasses = "w-5 h-5 transition-all";
const iconActiveColor = "text-primary";
const iconInactiveColor = "text-muted-foreground";

const sidebarItems: SidebarItem[] = [
  {
    icon: <PlusCircle className={iconBaseClasses} />,
    label: "New Chat",
    active: true,
  },
  {
    icon: <BookOpen className={iconBaseClasses} />,
    label: "Tools",
  },
  {
    icon: <History className={iconBaseClasses} />,
    label: "History",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isSheetOpen,
  setIsSheetOpen,
  isSidebarExpanded,
  isManuallyExpanded,
  setIsSidebarExpanded,
  handleToggleSidebar,
  sessions,
  activeSessionId,
  onSelectSession,
}) => {
  return (
    <div className="flex bg-white">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="absolute top-4 left-4 md:hidden">
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 flex flex-col gap-4 h-[calc(100vh-120px)]">
            {sidebarItems.map((item, i) => (
              <Button
                key={i}
                variant={item.active ? "secondary" : "ghost"}
                className="justify-start gap-2"
              >
                {item.icon}
                {item.label}
              </Button>
            ))}

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-10" />
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Recent Chats
              </h3>
              <div className="mt-4">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    className={`flex items-center w-full px-3 py-2 rounded-md transition ${
                      activeSessionId === session.id
                        ? "bg-muted text-primary"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    {isSidebarExpanded && (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <span className="truncate text-sm">
                          {session.title}
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <UserProfile />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 💻 Desktop Sidebar */}
      <div
        className={`bg-white hidden md:flex h-svh border-r transition-all duration-300 ease-in-out bg-background ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => {
          if (!isManuallyExpanded) setIsSidebarExpanded(true);
        }}
        onMouseLeave={() => {
          if (!isManuallyExpanded) setIsSidebarExpanded(false);
        }}
      >
        <div className="flex flex-col w-full relative">
          {/* Logo + Toggle */}
          <div className="flex items-center justify-between p-4">
            {isSidebarExpanded && <Logo />}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={handleToggleSidebar}
            >
              <VscThreeBars size={22} />
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1 px-2">
            {sidebarItems.map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-muted ${
                  item.active
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`${
                    item.active ? iconActiveColor : iconInactiveColor
                  }`}
                >
                  {item.icon}
                </span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            ))}
            {isSidebarExpanded && (
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-muted border-none focus-visible:ring-0"
                />
              </div>
            )}
          </div>

          <div className="flex-1 mt-4 px-4 overflow-y-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                className={`flex items-center w-full px-3 py-1 rounded-md transition ${
                  activeSessionId === session.id
                    ? "bg-muted text-primary"
                    : "hover:bg-muted text-muted-foreground"
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                {isSidebarExpanded && (
                  <>
                    <span className="truncate text-sm ml-2">
                      {session.title}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>

          {isSidebarExpanded && (
            <div className="mt-auto border-t p-4">
              <UserProfile />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
