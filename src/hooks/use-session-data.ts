import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
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
    setQuickSummary,
  } = useSessionStore();

  const createNewSession = useCallback(
    async (id: string) => {
      console.log(user);
      try {
        const sessionRef = doc(db, "sessions", id);
        const existing = await getDoc(sessionRef);
        if (existing.exists()) {
          console.log("Session already exists, skipping creation:", id);
          setActiveSession(existing.data() as Session);
          router.replace(`/s/${id}`);
          return;
        }

        // Get anonymous user ID or use authenticated user ID
        const { getAnonymousUserId, addAnonymousSessionId } = await import(
          "@/lib/session-migration"
        );
        const effectiveUserId = user?.uid || getAnonymousUserId();
        const effectiveEmail = user?.email || "Guest";

        const newSession: Session = {
          id,
          userId: effectiveUserId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: effectiveEmail,
          owner: effectiveEmail,
          sharedWith: [],
          folder: "private",
          isStarred: false,
          noOfAttachments: 0,
          title: "New Session",
        };

        // ALWAYS save to Firestore (even for anonymous users)
        await setDoc(sessionRef, newSession);

        // Track anonymous session in localStorage
        if (!user) {
          addAnonymousSessionId(id);
        }

        setActiveSession(newSession);
        console.log(
          "New session created:",
          newSession.id,
          "User:",
          effectiveUserId
        );
        router.replace(`/s/${id}`);
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
      console.log(user);

      try {
        const sessionRef = doc(db, "sessions", id);
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists()) {
          toast({ title: "Session not found" });
          router.push("/");
          return;
        }

        const sessionData = sessionDoc.data() as Session;

        setActiveSession(sessionData);
        setQuickSummary(sessionData.quickSummary || "");
        setSummaries(sessionData.summaries || null);
        setLoadingStates({ session: false });

        if (user?.uid) {
          const [loadedParagraphs, loadedChatMessages] = await Promise.all([
            loadParagraphs(id),
            loadChatMessages(id),
          ]);
          setParagraphs(loadedParagraphs);
          setChatMessages(loadedChatMessages);
        }
        router.replace(`/s/${id}`);
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
