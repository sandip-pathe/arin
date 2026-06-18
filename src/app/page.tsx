"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MinimalSession, SessionTimestamp } from "@/types/page";
import NotebookCard from "@/components/notebook-card";
import {
  FiArchive,
  FiArrowRight,
  FiFolder,
  FiLoader,
  FiSettings,
  FiStar,
} from "react-icons/fi";
import { LuFileStack } from "react-icons/lu";
import { BsPersonRolodex } from "react-icons/bs";
import { ChatWelcome } from "@/components/chat-welcome";
import Footer from "@/components/footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LocalExportModal } from "@/components/settings/local-export";
import useSessionStore from "@/store/session-store";
import { UnifiedSettingsModal } from "@/components/settings/settings";
import { v7 } from "uuid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { endTimer, logPerf, startTimer } from "@/lib/hi";
import { resetDocuments } from "@/lib/document-refs";
import { useToast } from "@/hooks/use-toast";
import {
  deleteLocalSession,
  getLocalSessions,
  updateLocalSessionMeta,
} from "@/lib/local-session";

const getSessionTime = (value: SessionTimestamp | undefined): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value instanceof Date) return value.getTime();
  if ("toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return 0;
};

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<MinimalSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [active, setactive] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
  const [archived, setarchived] = useState<MinimalSession[]>([]);
  const [exportSessionId, setExportSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const {
    showExportModal,
    setShowExportModal,
    showSettingsModal,
    setShowSettingsModal,
    resetSessionState,
  } = useSessionStore();

  const refreshLocalSessions = useCallback(() => {
    const fetchTimer = startTimer("refreshLocalSessions");
    setLoadingSessions(true);

    try {
      const localSessions = getLocalSessions();
      setSessions(
        localSessions.filter((session) => session.folder !== "archived")
      );
      setarchived(
        localSessions.filter((session) => session.folder === "archived")
      );
      logPerf("Loaded local sessions", { count: localSessions.length });
    } catch (error) {
      console.error("Error loading local sessions:", error);
      logPerf("Error in refreshLocalSessions", { error });
      toast({
        title: "Could not load sessions",
        description: "Your browser storage could not be read.",
        variant: "destructive",
      });
    } finally {
      setLoadingSessions(false);
      endTimer(fetchTimer);
    }
  }, [toast]);

  useEffect(() => {
    refreshLocalSessions();
  }, [refreshLocalSessions]);

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      toast({
        title: event.detail.title,
        description: event.detail.description,
      });
    };

    window.addEventListener("show-toast" as any, handleToast as any);
    return () => {
      window.removeEventListener("show-toast" as any, handleToast as any);
    };
  }, [toast]);

  const filtered =
    active === "archived"
      ? archived
      : sessions.filter((session) => {
          if (active === "all") return session.folder !== "archived";
          if (active === "starred") return session.isStarred;
          return session.folder === active;
        });

  const sortedSessions = [...filtered].sort((a, b) => {
    if (sortOption === "recent") {
      return getSessionTime(b.updatedAt) - getSessionTime(a.updatedAt);
    }

    return a.title.localeCompare(b.title);
  });

  const toggleStar = (sessionId: string) => {
    const session = [...sessions, ...archived].find((s) => s.id === sessionId);
    if (!session) return;

    updateLocalSessionMeta(sessionId, { isStarred: !session.isStarred });
    refreshLocalSessions();
  };

  const moveToFolder = (sessionId: string, folder: string) => {
    updateLocalSessionMeta(sessionId, { folder });
    refreshLocalSessions();
  };

  const deleteSession = (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    deleteLocalSession(sessionId);
    refreshLocalSessions();
  };

  const getEmptyStateMessage = () => {
    switch (active) {
      case "all":
        return {
          title: "No local sessions yet",
          description:
            "Create a private legal workspace. Documents and chats stay in this browser unless you export them.",
        };
      case "personal":
        return {
          title: "No personal sessions",
          description: "Sessions you keep in Personal will appear here.",
        };
      case "starred":
        return {
          title: "No starred sessions",
          description: "Sessions you mark as favorite will appear here.",
        };
      case "archived":
        return {
          title: "No archived sessions",
          description: "Sessions you archive will appear here.",
        };
      default:
        return {
          title: "No sessions",
          description: "Create your first session to get started.",
        };
    }
  };

  const emptyStateMessage = getEmptyStateMessage();
  const hasAnySessions = sessions.length > 0 || archived.length > 0;

  const folderOptions = [
    { id: "all", label: "All", icon: <FiFolder className="mr-2" /> },
    {
      id: "personal",
      label: "Personal",
      icon: <BsPersonRolodex className="mr-2" />,
    },
    { id: "starred", label: "Starred", icon: <FiStar className="mr-2" /> },
    { id: "archived", label: "Archived", icon: <FiArchive className="mr-2" /> },
  ];

  const handleCreateNewSession = () => {
    if (isCreatingSession) return;

    const newId = v7();
    setIsCreatingSession(true);
    resetSessionState();
    resetDocuments();
    window.requestAnimationFrame(() => {
      router.push(`/s/${newId}?new=true`);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafafa] to-[#f1f5f9]">
      <header className="sticky top-0 z-30 bg-white/95 px-4 sm:px-6 md:px-8 py-2 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Open settings"
          >
            <FiSettings className="text-gray-600" size={18} />
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Open settings"
          >
            <FiSettings className="text-gray-600" size={18} />
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8 md:py-10 max-w-7xl mx-auto">
        <div className="mx-0 sm:mx-4 md:mx-8 lg:mx-16">
          <div className="flex w-full justify-start h-auto sm:h-[60px] md:h-[80px]">
            <ChatWelcome />
          </div>

          <div className="w-full mx-auto my-6 sm:my-8 md:my-10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl md:rounded-2xl opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <button
              onClick={handleCreateNewSession}
              disabled={isCreatingSession}
              aria-busy={isCreatingSession}
              className="relative w-full flex items-center justify-between rounded-xl md:rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 text-neutral-800 hover:border-blue-300 transition-all duration-300 py-4 px-4 sm:py-5 sm:px-6 md:px-8 font-semibold text-base sm:text-lg group disabled:cursor-wait disabled:border-blue-300 disabled:from-blue-50 disabled:to-white"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  {isCreatingSession ? (
                    <FiLoader className="text-blue-600 text-lg sm:text-xl md:text-2xl animate-spin" />
                  ) : (
                    <LuFileStack className="text-blue-600 text-lg sm:text-xl md:text-2xl" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg sm:text-xl md:text-xl text-neutral-800">
                    {isCreatingSession
                      ? "Opening legal workspace"
                      : "Start New Legal Session"}
                  </div>
                  <div className="text-xs sm:text-sm font-normal text-neutral-500 mt-1">
                    {isCreatingSession
                      ? "Preparing upload, citations, and chat"
                      : "AI-powered Summarization and Analysis"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCreatingSession ? (
                  <span className="text-sm font-medium text-blue-600">
                    Please wait
                  </span>
                ) : (
                  <FiArrowRight className="text-blue-600 group-hover:translate-x-2 transition-transform duration-200 text-lg sm:text-xl" />
                )}
              </div>
            </button>
            <div aria-live="polite" className="sr-only">
              {isCreatingSession ? "Opening a new legal workspace." : ""}
            </div>
          </div>

          {hasAnySessions && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4 sm:p-5 bg-white rounded-xl md:rounded-2xl border border-neutral-100 shadow-sm">
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <TooltipProvider>
                  {folderOptions.map((folder) => (
                    <Tooltip key={folder.id}>
                      <TooltipTrigger asChild>
                        <button
                          className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all ${
                            active === folder.id
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-neutral-600 hover:bg-neutral-50 border border-neutral-200"
                          }`}
                          onClick={() => setactive(folder.id)}
                        >
                          <span className="sm:inline">{folder.icon}</span>
                          <span className="text-xs hidden sm:inline sm:text-sm">
                            {folder.label}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{folder.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              <div className="flex items-center w-full md:w-auto">
                <Select onValueChange={setSortOption} value={sortOption}>
                  <SelectTrigger className="text-sm h-10 sm:h-11 w-full md:w-48 rounded-lg sm:rounded-xl border border-neutral-300 shadow-sm focus:ring-2 focus:ring-blue-600 bg-white">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most recent</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
                {active === "archived" ? "Archived Sessions" : "Recent Sessions"}
              </h2>
              <span className="text-xs sm:text-sm text-neutral-500">
                {sortedSessions.length} sessions
              </span>
            </div>

            {loadingSessions ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-neutral-200"
                  >
                    <div className="animate-pulse h-5 sm:h-6 bg-neutral-200 rounded w-3/4 mb-3 sm:mb-4" />
                    <div className="animate-pulse h-3 sm:h-4 bg-neutral-200 rounded w-full mb-2" />
                    <div className="animate-pulse h-3 sm:h-4 bg-neutral-200 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : sortedSessions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {sortedSessions.map((session) => (
                  <NotebookCard
                    key={session.id}
                    title={session.title}
                    updatedAt={getSessionTime(session.updatedAt)}
                    isStarred={session.isStarred}
                    folder={session.folder}
                    onClick={() => router.push(`/s/${session.id}`)}
                    onToggleStar={() => toggleStar(session.id)}
                    onMoveToFolder={(folder) =>
                      moveToFolder(session.id, folder)
                    }
                    onArchive={() => moveToFolder(session.id, "archived")}
                    onDelete={() => deleteSession(session.id)}
                    onExport={() => {
                      setShowExportModal(true);
                      setExportSessionId(session.id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-dashed border-neutral-300">
                <div className="bg-blue-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <FiFolder className="text-blue-500 text-lg sm:text-xl md:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
                  {emptyStateMessage?.title}
                </h3>
                <p className="text-neutral-500 text-sm sm:text-base max-w-md mx-auto mb-4 sm:mb-6">
                  {emptyStateMessage?.description}
                </p>
                <Button
                  className="rounded-lg sm:rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={handleCreateNewSession}
                  disabled={isCreatingSession}
                >
                  {isCreatingSession ? "Opening Session..." : "Create Session"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <LocalExportModal
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        sessionId={exportSessionId || ""}
      />
      <UnifiedSettingsModal
        isOpen={showSettingsModal}
        isOpenChange={setShowSettingsModal}
      />
    </div>
  );
}
