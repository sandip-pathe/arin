// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
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
  FiX,
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
import { motion } from "framer-motion";
import {
  AccountModal,
  SettingsModal,
  ShareModal,
} from "@/components/sidebar-modals";
import Logo from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<MinimalSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [activeFolder, setActiveFolder] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
  const [activeTab, setActiveTab] = useState<"my" | "shared">("my");
  const [modalType, setModalType] = useState<
    "home" | "share" | "settings" | "account" | null
  >(null);

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

  function closeModal(): void {
    setModalType(null);
  }

  return (
    <div className="min-h-screen bg-white select-none overflow-hidden">
      <div className="mx-4 p-2 flex items-center justify-between">
        <Logo />
        {/* User Avatar */}
        <div className="flex items-center gap-4 flex-row">
          <FiSettings
            className="mx-auto text-gray-600 cursor-pointer hover:text-blue-600 transition"
            size={20}
            onClick={() => setModalType("settings")}
          />
          <div
            className="relative group cursor-pointer"
            onClick={() => setModalType("account")}
          >
            <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
              <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      <main className="m-12 overflow-hidden">
        <ChatWelcome />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 select-none"></div>

        {/* Folder Tabs */}
        <div className="text-sm w-full max-w-3xl mx-auto">
          <div className="text-sm gap-2 mb-4 items-center justify-between flex flex-row font-medium mt-auto">
            {folderOptions.map((folder) => (
              <button
                key={folder.id}
                className={`w-full text-start ${
                  activeFolder === folder.id
                    ? "text-black border-b-2 border-black"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveFolder(folder.id)}
              >
                <span className="flex flex-row items-center">
                  {folder.icon}
                  {folder.label}
                </span>
              </button>
            ))}
            <div className="gap-2 items-center">
              <Select onValueChange={setSortOption} value={sortOption}>
                <SelectTrigger className="text-sm h-8 w-28">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ul className="bg-white" style={{ scrollbarWidth: "none" }}>
            {loadingSessions
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse bg-gray-100 p-7 border-none rounded-lg mb-4"
                  />
                ))
              : sessions.map((session) => (
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
                    onShare={() => setModalType("share")}
                  />
                ))}
          </ul>
        </div>
      </main>

      <div className="mx-auto right-0 max-w-6xl bg-transparent">
        <Footer />
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-none w-full p-12 max-w-4xl h-[90dvh] shadow-none relative"
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
              {modalType === "share" && <ShareModal />}
              {modalType === "settings" && <SettingsModal />}
              {modalType === "account" && <AccountModal />}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
