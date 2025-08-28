import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  handleProcessingError,
  loadParagraphs,
  loadChatMessages,
} from "@/lib/functions";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@/types/page";
import useSessionStore from "@/store/session-store";

export const useSessionData = () => {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const {
    activeSession,
    setActiveSession,
    setLoadingStates,
    setParagraphs,
    setChatMessages,
    setSummaries,
  } = useSessionStore();

  const createNewSession = useCallback(
    async (id: string) => {
      try {
        const sessionRef = doc(db, "sessions", id);
        const existing = await getDoc(sessionRef);
        if (existing.exists()) {
          console.log("Session already exists, skipping creation:", id);
          setActiveSession(existing.data() as Session);
          router.replace(`/${id}`);
          return;
        }

        const newSession: Session = {
          id,
          userId: user!.uid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: user!.email ?? "Unknown",
          owner: user!.email ?? "Unknown",
          sharedWith: [],
          folder: "private",
          isStarred: false,
          noOfAttachments: 0,
          title: "New Session",
        };

        await setDoc(sessionRef, newSession);
        setActiveSession(newSession);
        console.log("New session created:", newSession.id);
        router.replace(`/${id}`);
      } catch (error) {
        handleProcessingError("Create Session", error);
        toast({
          variant: "destructive",
          title: "Error creating session",
          description: "Failed to initialize new session",
        });
      }
    },
    [user, setActiveSession, toast, router]
  );

  const loadSessionData = useCallback(
    async (id: string) => {
      setLoadingStates({ session: true });

      try {
        const sessionRef = doc(db, "sessions", id);
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists()) {
          toast({ title: "Session not found" });
          router.push("/");
          return;
        }

        const sessionData = sessionDoc.data() as Session;

        if (
          sessionData.userId !== user?.uid &&
          !sessionData.sharedWith?.includes(user?.email ?? "")
        ) {
          toast({ title: "Access Denied", variant: "destructive" });
          router.push("/");
          return;
        }

        setActiveSession(sessionData);
        setSummaries(sessionData.summaries || null);
        setLoadingStates({ session: false });

        if (sessionData.userId === user?.uid) {
          const [loadedParagraphs, loadedChatMessages] = await Promise.all([
            loadParagraphs(id),
            loadChatMessages(id),
          ]);
          setParagraphs(loadedParagraphs);
          setChatMessages(loadedChatMessages);
        }
        router.replace(`/${id}`);
      } catch (error) {
        handleProcessingError("Load Session Data", error);
        router.push("/");
      }
    },
    [
      user,
      setActiveSession,
      setSummaries,
      setParagraphs,
      setChatMessages,
      toast,
      router,
      setLoadingStates,
    ]
  );

  return {
    sessionId,
    activeSession,
    createNewSession,
    loadSessionData,
  };
};
