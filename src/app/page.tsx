// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MinimalSession } from "@/types/page";
import NotebookCard from "@/components/notebook-card";
import {
  FiFolder,
  FiStar,
  FiUsers,
  FiArchive,
  FiSettings,
  FiArrowRight,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/settings/sharing";
import { Membership } from "@/components/settings/membership";
import { AccountSettingsModal } from "@/components/settings/accountSettings";
import useSessionStore from "@/store/session-store";
import { UnifiedSettingsModal } from "@/components/settings/settings";
import { useAuthStore } from "@/store/auth-store";
import { v7 } from "uuid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEBUG_PERF, logPerf, startTimer, endTimer } from "@/lib/hi";
import MasterLoader from "@/components/home-loader";

export default function HomePage() {
  const timerId = startTimer("HomePage Render");
  const [pageLoading, setPageLoading] = useState(true);
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<MinimalSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [active, setactive] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
  const [archived, setarchived] = useState<MinimalSession[]>([]);
  const [shareSessionId, setShareSessionId] = useState<string | null>(null);

  const {
    showAccountModal,
    setShowAccountModal,
    showMembershipModal,
    setShowMembershipModal,
    showShareModal,
    setShowShareModal,
    showSettingsModal,
    setShowSettingsModal,
    resetSessionState,
  } = useSessionStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchNonarchived = async () => {
    const fetchTimer = startTimer("fetchNonarchived");
    if (!user) return;

    try {
      const userSessionsQuery = query(
        collection(db, "sessions"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc"),
        limit(6)
      );

      let sharedSessionsQuery = null;
      if (user.email) {
        sharedSessionsQuery = query(
          collection(db, "sessions"),
          where("sharedWith", "array-contains", user.email),
          limit(6)
        );
      }

      const [userSnapshot, sharedSnapshot] = await Promise.all([
        getDocs(userSessionsQuery),
        sharedSessionsQuery ? getDocs(sharedSessionsQuery) : { docs: [] },
      ]);

      const allSessionsMap = new Map<string, MinimalSession>();
      const processDoc = (docSnap: any) => {
        const data = docSnap.data();
        const session: MinimalSession = {
          id: docSnap.id,
          title: data.title || "Untitled",
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
          createdAt: data.createdAt?.toMillis() || Date.now(),
          userId: data.userId || user.uid,
          isStarred: data.isStarred || false,
          noOfAttachments: data.noOfAttachments || 0,
          folder: data.folder || "personal",
          sharedWith: data.sharedWith || [],
          owner: data.owner,
        };
        allSessionsMap.set(session.id, session);
      };

      userSnapshot.forEach(processDoc);
      if ("forEach" in sharedSnapshot) sharedSnapshot.forEach(processDoc);

      const sessionsData = Array.from(allSessionsMap.values());
      setSessions(sessionsData);
      logPerf("Fetched non-archived sessions", { count: sessionsData.length });
    } catch (error) {
      console.error("Error fetching non-archived sessions:", error);
      logPerf("Error in fetchNonarchived", { error });
    } finally {
      endTimer(fetchTimer);
    }
  };

  const fetcharchived = async () => {
    const fetchTimer = startTimer("fetcharchived");
    if (!user) return;

    try {
      const archivedQuery = query(
        collection(db, "sessions"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );

      const snapshot = await getDocs(archivedQuery);
      const sessionsData: MinimalSession[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const session: MinimalSession = {
          id: docSnap.id,
          title: data.title || "Untitled",
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
          createdAt: data.createdAt?.toMillis() || Date.now(),
          userId: data.userId || user.uid,
          isStarred: data.isStarred || false,
          noOfAttachments: data.noOfAttachments || 0,
          folder: data.folder || "archived",
          sharedWith: data.sharedWith || [],
          owner: data.owner,
        };
        sessionsData.push(session);
      });

      setarchived(sessionsData);
      logPerf("Fetched archived sessions", { count: sessionsData.length });
    } catch (error) {
      console.error("Error fetching archived sessions:", error);
      logPerf("Error in fetcharchived", { error });
    } finally {
      endTimer(fetchTimer);
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      const timerId = startTimer("fetchSessions");
      if (!user) return;

      setLoadingSessions(true);
      try {
        await Promise.all([fetchNonarchived()]);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        logPerf("Error in fetchSessions", { error });
      } finally {
        setLoadingSessions(false);
        endTimer(timerId);
      }
    };

    if (user) fetchSessions();
  }, [user, loading]);

  useEffect(() => {
    if (active === "archived" && archived.length === 0) {
      fetcharchived();
    }
  }, [active, archived.length]);

  const filtered =
    active === "archived"
      ? archived
      : sessions.filter((session) => {
          if (active === "all") return session.folder !== "archived";
          if (active === "starred") return session.isStarred;
          if (active === "shared") return session.sharedWith.length > 0;
          return session.folder === active;
        });

  const sortedSessions = [...filtered].sort((a, b) => {
    if (sortOption === "recent") {
      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const toggleStar = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const session = sessions.find((s) => s.id === sessionId);

      if (session) {
        const newIsStarred = !session.isStarred;
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, isStarred: newIsStarred } : s
          )
        );

        await updateDoc(sessionRef, { isStarred: newIsStarred });
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, isStarred: !s.isStarred } : s
        )
      );
    }
  };

  const moveToFolder = async (sessionId: string, folder: string) => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, folder } : s))
      );

      await updateDoc(sessionRef, { folder });
    } catch (error) {
      console.error("Error moving to folder:", error);
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, folder: session.folder } : s
          )
        );
      }
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      await deleteDoc(sessionRef);
    } catch (error) {
      console.error("Error deleting session:", error);
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setSessions((prev) => [...prev, session]);
      }
    } finally {
      if (sessions.length < 4) {
        fetchNonarchived();
      }
    }
  };

  const getEmptyStateMessage = () => {
    switch (active) {
      case "all":
        return {
          title: "No Sessions yet",
          description:
            "Create your first Session to organize case research, legal analysis, and case notes.",
        };
      case "personal":
        return {
          title: "No Personal Sessions",
          description:
            "Sessions that are not shared and not archived will appear here.",
        };
      case "starred":
        return {
          title: "No Starred Sessions",
          description: "Sessions you mark as favorite will appear here.",
        };
      case "shared":
        return {
          title: "No Shared Sessions",
          description: "Sessions shared with you will appear here.",
        };
      case "archived":
        return {
          title: "No Archived Sessions",
          description: "Sessions you archive will appear here.",
        };
      default:
        return {
          title: "No Sessions",
          description: "Create your first Session to get started.",
        };
    }
  };

  const emptyStateMessage = getEmptyStateMessage();

  const folderOptions = [
    { id: "all", label: "All", icon: <FiFolder className="mr-2" /> },
    {
      id: "personal",
      label: "Personal",
      icon: <BsPersonRolodex className="mr-2" />,
    },
    { id: "starred", label: "Starred", icon: <FiStar className="mr-2" /> },
    {
      id: "shared",
      label: "Shared with me",
      icon: <FiUsers className="mr-2" />,
    },
    { id: "archived", label: "Archived", icon: <FiArchive className="mr-2" /> },
  ];

  const handleCreateNewSession = () => {
    const newId = v7();
    resetSessionState();
    router.push(`/${newId}?new=true`);
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setPageLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (pageLoading) return <MasterLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafafa] to-[#f1f5f9]">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-white/95 px-8 py-2 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center">
          <Logo />
          <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            PRO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiSettings className="text-gray-600" size={18} />
          </button>
          <button
            onClick={() => setShowAccountModal(true)}
            className="relative group"
          >
            <Avatar className="h-10 w-10 border-blue-500 border-2 shadow-sm">
              <AvatarFallback className="font-medium bg-blue-50 text-blue-700">
                {user?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-10 max-w-7xl mx-auto">
        <div className="mx-16">
          {/* Welcome banner */}
          <div className="flex w-full justify-start h-[80px]">
            <ChatWelcome />
          </div>

          {/* Create new session */}
          <div className="w-full mx-auto my-10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl  opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <button
              onClick={handleCreateNewSession}
              className="relative w-full flex items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 text-neutral-800 hover:border-blue-300 transition-all duration-300 py-5 px-8 font-semibold text-lg group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <LuFileStack className="text-blue-600" size={24} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xl text-neutral-800">
                    Start New Legal Session
                  </div>
                  <div className="text-sm font-normal text-neutral-500 mt-1">
                    AI-powered Summarization and Analysis
                  </div>
                </div>
              </div>
              <FiArrowRight
                size={22}
                className="text-blue-600 group-hover:translate-x-2 transition-transform duration-200"
              />
            </button>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-5 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {folderOptions.map((folder) => (
                  <Tooltip key={folder.id}>
                    <TooltipTrigger
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                        active === folder.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-neutral-600 hover:bg-neutral-50 border border-neutral-200"
                      }`}
                      onClick={() => setactive(folder.id)}
                    >
                      {folder.icon}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{folder.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>

            <div className="flex items-center">
              <Select onValueChange={setSortOption} value={sortOption}>
                <SelectTrigger className="text-sm h-11 w-48 rounded-xl border border-neutral-300 shadow-sm focus:ring-2 focus:ring-blue-600 bg-white">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sessions grid */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-800">
                Recent Sessions
              </h2>
              <span className="text-sm text-neutral-500">
                {sortedSessions.length} sessions
              </span>
            </div>

            {loadingSessions ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200"
                  >
                    <div className="animate-pulse h-6 bg-neutral-200 rounded w-3/4 mb-4" />
                    <div className="animate-pulse h-4 bg-neutral-200 rounded w-full mb-2" />
                    <div className="animate-pulse h-4 bg-neutral-200 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : sessions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {sortedSessions.map((session) => (
                  <NotebookCard
                    key={session.id}
                    id={session.id}
                    title={session.title}
                    updatedAt={
                      typeof session.updatedAt === "number"
                        ? session.updatedAt
                        : session.updatedAt.getTime()
                    }
                    isStarred={session.isStarred}
                    folder={session.folder}
                    sharedCount={session.sharedWith?.length || 0}
                    onClick={() => router.push(`/${session.id}`)}
                    onToggleStar={() => toggleStar(session.id)}
                    onMoveToFolder={(folder) =>
                      moveToFolder(session.id, folder)
                    }
                    onArchive={() => moveToFolder(session.id, "archived")}
                    onDelete={() => deleteSession(session.id)}
                    onShare={() => {
                      setShowShareModal(true);
                      setShareSessionId(session.id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-300">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FiFolder className="text-blue-500" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {emptyStateMessage?.title}
                </h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-6">
                  {emptyStateMessage?.description}
                </p>
                <Button
                  className="rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3"
                  onClick={handleCreateNewSession}
                >
                  Create Session
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onOpenChange={setShowShareModal}
        sessionId={shareSessionId || ""}
      />
      <Membership
        isOpen={showMembershipModal}
        onOpenChange={setShowMembershipModal}
      />
      <AccountSettingsModal
        isOpen={showAccountModal}
        isOpenChange={setShowAccountModal}
      />
      <UnifiedSettingsModal
        isOpen={showSettingsModal}
        isOpenChange={setShowSettingsModal}
      />
    </div>
  );
}
