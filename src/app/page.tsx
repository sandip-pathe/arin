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
import { ThinkingLoader } from "@/components/ProgressStepper";

export default function HomePage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<MinimalSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [activeFolder, setActiveFolder] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
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

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      setLoadingSessions(true);
      try {
        // Create composite queries
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

        // Execute queries in parallel
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
            folder: data.folder || "personal", // Default to personal
            sharedWith: data.sharedWith || [],
            owner: data.owner,
          };
          allSessionsMap.set(session.id, session);
        };

        userSnapshot.forEach(processDoc);
        if ("forEach" in sharedSnapshot) sharedSnapshot.forEach(processDoc);

        let sessionsData = Array.from(allSessionsMap.values());

        // Apply client-side filtering - don't show archived in main view
        sessionsData = sessionsData
          .filter((s) => s.folder !== "archived")
          .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
          .slice(0, 6);

        setSessions(sessionsData);
        console.log("Fetched sessions:", sessionsData);
      } catch (error) {
        console.error("Error fetching sessions:", error);

        // Check for missing index error
        if (error instanceof Error && error.message.includes("index")) {
          console.error(
            "Firestore index missing. Create composite indexes for:"
          );
          console.error("1. userId (ascending), updatedAt (descending)");
          console.error("2. sharedWith (ascending), updatedAt (descending)");
        }
      } finally {
        setLoadingSessions(false);
      }
    };

    if (user) fetchSessions();
  }, [user, loading]);

  const toggleStar = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const session = sessions.find((s) => s.id === sessionId);

      if (session) {
        const newIsStarred = !session.isStarred;

        // Optimistic UI update
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, isStarred: newIsStarred } : s
          )
        );

        // Update in Firestore
        await updateDoc(sessionRef, {
          isStarred: newIsStarred,
        });
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      // Revert on error
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

      // Optimistic UI update
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, folder } : s))
      );

      // Update in Firestore
      await updateDoc(sessionRef, {
        folder,
      });
    } catch (error) {
      console.error("Error moving to folder:", error);
      // Revert on error
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
    if (
      !confirm(
        "Are you sure you want to delete this notebook? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const sessionRef = doc(db, "sessions", sessionId);

      // Optimistic UI update
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // Delete from Firestore
      await deleteDoc(sessionRef);
    } catch (error) {
      console.error("Error deleting session:", error);
      // Revert on error
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setSessions((prev) => [...prev, session]);
      }
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (activeFolder === "all") return true;
    if (activeFolder === "starred") return session.isStarred;
    if (activeFolder === "shared") return session.sharedWith.length > 0;
    if (activeFolder === "archived") return session.folder === "archived";
    return session.folder === activeFolder;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortOption === "recent") {
      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const folderOptions = [
    { id: "all", label: "All", icon: <FiFolder className="mr-2" /> },
    { id: "personal", label: "Personal", icon: <FiFolder className="mr-2" /> },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafafa] to-[#f1f5f9] overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiSettings className="text-gray-600" size={20} />
          </button>
          <button
            onClick={() => setShowAccountModal(true)}
            className="relative group"
          >
            <Avatar className="h-9 w-9 border-blue-600 border-2 shadow-sm">
              <AvatarFallback className="font-medium bg-blue-50 text-blue-700">
                {user?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 py-10 max-w-6xl mx-auto">
        {/* Welcome banner */}
        <div className="mx-auto flex w-full justify-center">
          <ChatWelcome />
        </div>

        <ThinkingLoader
          totalTime={1454}
          paragraphsCount={254}
          wordsCount={2512}
          currentModel="GPT-4o"
        />
        {/* Create new session */}
        <div className="w-full max-w-3xl mx-auto my-16">
          <button
            onClick={handleCreateNewSession}
            className="group w-full flex items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-[#cee2f5] to-[#acd5fe] text-neutral-800 shadow-sm hover:shadow-md hover:border-blue-600 transition-all duration-200 py-5 px-6 font-semibold text-lg"
          >
            <FiArrowRight
              size={22}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
            <span>Start Your Session</span>
          </button>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {folderOptions.map((folder) => (
              <button
                key={folder.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFolder === folder.id
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFolder(folder.id)}
              >
                {folder.icon}
                {folder.label}
              </button>
            ))}
          </div>

          <div className="flex items-center">
            <Select onValueChange={setSortOption} value={sortOption}>
              <SelectTrigger className="text-sm h-10 w-44 rounded-xl border border-neutral-300 shadow-sm focus:ring-2 focus:ring-blue-600">
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
        <div className="mb-20">
          {loadingSessions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-200"
                >
                  <div className="animate-pulse h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  onMoveToFolder={(folder) => moveToFolder(session.id, folder)}
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
            <div className="text-center py-20">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiFolder className="text-blue-500" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No notebooks yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Create your first notebook to start organizing your ideas and
                projects.
              </p>
              <Button
                className="rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3"
                onClick={handleCreateNewSession}
              >
                Create Notebook
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Footer />
      </div>

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
