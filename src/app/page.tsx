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
  getDoc,
  limit,
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
        // 1. Fetch user's own sessions (no orderBy)
        const userSessionsQuery = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid),
          limit(5)
        );

        // 2. Fetch sessions shared with this user
        const sharedSessionsQuery = query(
          collection(db, "sessions"),
          where("sharedWith", "array-contains", user.email),
          limit(5)
        );

        const [userSnapshot, sharedSnapshot] = await Promise.all([
          getDocs(userSessionsQuery),
          getDocs(sharedSessionsQuery),
        ]);

        const allSessionsMap = new Map<string, MinimalSession>();

        const processDoc = (docSnap: any) => {
          const data = docSnap.data();
          const session: MinimalSession = {
            id: docSnap.id,
            title: data.title ?? "Untitled",
            updatedAt: data.updatedAt?.toMillis() || Date.now(),
            createdAt: data.createdAt?.toMillis() || Date.now(),
            userId: data.userId || user.uid,
            isStarred: data.starred || false,
            noOfAttachments: data.attachments?.length || 0,
            folder: data.folder || "personal",
            sharedWith: data.sharedWith || [],
            owner: data.userId || user.uid,
          };

          allSessionsMap.set(session.id, session);
        };

        userSnapshot.forEach(processDoc);
        sharedSnapshot.forEach(processDoc);

        let sessionsData = Array.from(allSessionsMap.values());

        // 3. Sort sessions by updatedAt DESC (client-side)
        sessionsData.sort(
          (a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0)
        );

        // 4. Apply user-specific manual order (optional)
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data()?.sessionOrder) {
          const sessionOrder: string[] = userDoc.data().sessionOrder;
          sessionsData.sort((a, b) => {
            const aIndex = sessionOrder.indexOf(a.id);
            const bIndex = sessionOrder.indexOf(b.id);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
        }

        // 5. Show only top 6 sessions (recent or starred)
        sessionsData = sessionsData
          .filter((s) => s.folder !== "archived")
          .slice(0, 6);

        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    if (!loading && user) {
      fetchSessions();
    }
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
    if (activeFolder === "starred") return session.isStarred;
    if (activeFolder === "all") return true;
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
    { id: "starred", label: "Starred", icon: <FiStar className="mr-2" /> },
    { id: "personal", label: "Personal", icon: <FiFolder className="mr-2" /> },
    {
      id: "shared",
      label: "Shared with me",
      icon: <FiUsers className="mr-2" />,
    },
    { id: "archived", label: "Archived", icon: <FiArchive className="mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <header className="sticky top-0 z-10 bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
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
            <Avatar className="h-9 w-9 border-blue-600 border-2">
              <AvatarFallback className="font-medium bg-blue-50">
                {user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      <main className="px-4 py-8 max-w-6xl mx-auto">
        <div className="mx-auto flex w-full">
          <ChatWelcome />
        </div>

        <div className="w-full max-w-3xl mx-auto my-16">
          <button
            onClick={() => router.push("/session?new=true")}
            className="group w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-gradient-to-br from-white via-[#f9fafb] to-[#f1f5f9] text-neutral-800 shadow-sm hover:shadow-md hover:border-blue-900 hover:bg-white transition-all duration-200 py-4 px-6 font-semibold text-lg"
          >
            <FiArrowRight
              size={22}
              className="group-hover:scale-110 transition-transform duration-200"
            />
            <span className="">Start Your Session</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 my-6">
          <div className="flex flex-wrap gap-1 md:gap-2">
            {folderOptions.map((folder) => (
              <button
                key={folder.id}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFolder === folder.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:bg-gray-100"
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
              <SelectTrigger className="text-sm h-10 w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-16">
          {loadingSessions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse bg-gray-100 h-40 rounded-xl"
                />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFolder className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notebooks yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Create your first notebook to start organizing your ideas and
                projects.
              </p>
              <Button className="mt-4" onClick={() => router.push("/new")}>
                Create Notebook
              </Button>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Footer />
      </div>
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
