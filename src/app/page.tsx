// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "@/components/logo";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MinimalSession } from "@/types/page";
import { Plus } from "lucide-react";
import { ChatWelcome } from "@/components/chat-welcome";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<MinimalSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
          const q = query(
            collection(db, "sessions"),
            where("userId", "==", user.uid),
            orderBy("updatedAt", "desc"),
            limit(10)
          );
          const querySnapshot = await getDocs(q);
          const sessionsData: MinimalSession[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            sessionsData.push({
              id: doc.id,
              title: data.title ?? "Untitled",
              updatedAt: data.updatedAt?.toMillis() ?? Date.now(),
            });
          });
          setSessions(sessionsData);
        } catch (error) {
          console.error("Error fetching sessions:", error);
        } finally {
          setLoadingSessions(false);
        }
      };

      fetchSessions();
    }
  }, [user, loading]);

  const createNewSession = async () => {
    if (!user) return;
    const sessionId = uuidv4();
    router.push(`/${sessionId}?new=true`);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative overflow-hidden">
            <div className="flex items-center select-none">
              <span className="font-logo text-9xl font-bold tracking-tighter text-primary">
                Arin
              </span>
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
                animation: "glossy-move 1.5s infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
          <style jsx global>{`
            @keyframes glossy-move {
              0% {
                background-position: -100% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Logo />
          <ChatWelcome />
        </div>

        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={createNewSession}
            size="lg"
            className="px-8 py-6 text-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Session
          </Button>

          {loadingSessions ? (
            <div className="mt-8 w-full max-w-md">
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="mt-8 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant="outline"
                    className="w-full justify-start h-14 text-left"
                    onClick={() => router.push(`/${session.id}`)}
                  >
                    <div className="truncate">
                      <div className="font-medium">{session.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
