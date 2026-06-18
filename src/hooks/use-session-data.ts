import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { handleProcessingError } from "@/lib/functions";
import { useToast } from "@/hooks/use-toast";
import useSessionStore from "@/store/session-store";
import {
  ensureLocalSessionMeta,
  getLocalSessionMeta,
  loadLocalSessionContent,
  localMetaToSession,
} from "@/lib/local-session";

export const useSessionData = () => {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { toast } = useToast();

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
      try {
        const existing = getLocalSessionMeta(id);
        if (existing) {
          setActiveSession(localMetaToSession(existing));
          router.replace(`/s/${id}`);
          return;
        }

        const newSession = ensureLocalSessionMeta(id);
        setActiveSession(localMetaToSession(newSession));
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
    [setActiveSession, toast, router]
  );

  const loadSessionData = useCallback(
    async (id: string) => {
      setLoadingStates({ session: true });

      try {
        const sessionData = ensureLocalSessionMeta(id);
        const localContent = loadLocalSessionContent(id);
        const sessionWithLocalTitle = localMetaToSession({
          ...sessionData,
          title: localContent.title || sessionData.title,
          summary: localContent.summaries || sessionData.summary || null,
        });

        setActiveSession(sessionWithLocalTitle);
        setQuickSummary(localContent.quickSummary || "");
        setSummaries(localContent.summaries || null);
        setParagraphs(localContent.paragraphs || []);
        setChatMessages(localContent.chatMessages || []);
        router.replace(`/s/${id}`);
      } catch (error) {
        handleProcessingError("Load Session Data", error);
        router.push("/");
      } finally {
        setLoadingStates({ session: false });
      }
    },
    [
      setActiveSession,
      setSummaries,
      setParagraphs,
      setChatMessages,
      setQuickSummary,
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
