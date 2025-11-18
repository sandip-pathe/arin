import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { endTimer, logPerf, startTimer } from "@/lib/hi";

export type MembershipType = "trial" | "plus" | "pro" | "enterprise";
export type MembershipStatus = "active" | "expired" | "pending";

export interface MembershipDetails {
  type: MembershipType;
  status: MembershipStatus;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  lastDiscount?: {
    code: string;
    amount: number;
  };
  pagesRemaining?: number;
}

export const defaultSettings = {
  summary: {
    length: "medium",
    complexity: "balanced",
    tone: "professional",
    style: "detailed",
    jurisdiction: "",
    response: "auto",
  },
  chat: {
    conversationStyle: "balanced",
    responseLength: "medium",
    autoSuggestions: true,
  },
};

export const defaultMembership: MembershipDetails = {
  type: "trial",
  status: "pending",
  startDate: null,
  endDate: null,
  pagesRemaining: 0,
};

interface AuthState {
  user: User | null | undefined;
  dbUser: any | null;
  loading: boolean;
  settings: typeof defaultSettings;
  membership: MembershipDetails;

  setUser: (user: User | null | undefined) => void;
  setDbUser: (data: any) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: (user: User) => Promise<void>;
  updateSettings: (newSettings: {
    summary?: Partial<typeof defaultSettings.summary>;
    chat?: Partial<typeof defaultSettings.chat>;
  }) => void;
  updateMembership: (newMembership: Partial<MembershipDetails>) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        dbUser: null,
        loading: true,
        settings: defaultSettings,
        membership: defaultMembership,

        setUser: (user) => set({ user }),
        setDbUser: (data) => set({ dbUser: data }),
        setLoading: (loading) => set({ loading }),

        initializeAuth: async (user) => {
          const authTimer = startTimer("AuthInitialization");
          logPerf("Starting auth initialization", { userId: user.uid });

          set({ loading: true });

          try {
            // Migrate anonymous sessions to authenticated user
            const { migrateAnonymousSessions } = await import(
              "@/lib/session-migration"
            );
            const migratedCount = await migrateAnonymousSessions(
              user.uid,
              user.email || "user@example.com"
            );
            if (migratedCount > 0) {
              logPerf("Anonymous sessions migrated", { count: migratedCount });

              // Show success toast
              if (typeof window !== "undefined") {
                setTimeout(() => {
                  const toastEvent = new CustomEvent("show-toast", {
                    detail: {
                      title: "Sessions Restored",
                      description: `${migratedCount} session${
                        migratedCount > 1 ? "s" : ""
                      } from your previous work ${
                        migratedCount > 1 ? "have" : "has"
                      } been restored.`,
                    },
                  });
                  window.dispatchEvent(toastEvent);
                }, 1000);
              }
            }

            const userRef = doc(db, `users/${user.uid}`);
            const dbTimer = startTimer("FirestoreUserFetch");
            const snapshot = await getDoc(userRef);
            endTimer(dbTimer);
            logPerf("Firestore user document fetched", {
              exists: snapshot.exists(),
            });

            if (snapshot.exists()) {
              const userData = snapshot.data();
              logPerf("Existing user found", {
                hasSettings: !!userData.settings,
                hasMembership: !!userData.membership,
              });

              set({
                dbUser: userData,
                settings: {
                  summary: {
                    ...defaultSettings.summary,
                    ...userData.settings?.summary,
                  },
                  chat: {
                    ...defaultSettings.chat,
                    ...userData.settings?.chat,
                  },
                },
                membership: userData.membership ?? defaultMembership,
              });
            } else {
              // New user
              logPerf("Creating new user document");
              const newMembership: MembershipDetails = {
                type: "trial",
                status: "active",
                startDate: Timestamp.now(),
                endDate: Timestamp.fromDate(
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ),
                pagesRemaining: 10, // Start with 10 free pages on signup
              };

              const newUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                phoneNumber: user.phoneNumber,
                settings: defaultSettings,
                membership: newMembership,
              };

              const createTimer = startTimer("FirestoreUserCreate");
              await setDoc(userRef, newUser);
              endTimer(createTimer);

              set({
                dbUser: newUser,
                settings: defaultSettings,
                membership: newMembership,
              });

              logPerf("New user created successfully");
            }
          } catch (error: any) {
            logPerf("Auth initialization failed", { error: error.message });
            console.error("Failed to initialize auth store", error);
          } finally {
            set({ loading: false });
            endTimer(authTimer);
          }
        },

        // In your auth-store.ts, modify the updateSettings function
        updateSettings: (newSettings) =>
          set((state) => {
            const updatedSettings = {
              summary: { ...state.settings.summary, ...newSettings.summary },
              chat: { ...state.settings.chat, ...newSettings.chat },
            };
            return {
              settings: updatedSettings,
              dbUser: {
                ...state.dbUser,
                settings: updatedSettings,
              },
            };
          }),

        updateMembership: (newMembership) =>
          set((state) => ({
            membership: {
              ...state.membership,
              ...newMembership,
            },
            dbUser: {
              ...state.dbUser,
              membership: {
                ...state.membership,
                ...newMembership,
              },
            },
          })),

        resetAuth: () =>
          set({
            user: null,
            dbUser: null,
            loading: false,
            settings: defaultSettings,
            membership: defaultMembership,
          }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          dbUser: state.dbUser,
          settings: state.settings,
          membership: state.membership,
        }),
      }
    )
  )
);
