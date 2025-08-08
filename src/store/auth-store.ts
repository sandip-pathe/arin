import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  sessionsRemaining?: number;
}

export const defaultSettings = {
  summary: {
    length: "medium",
    complexity: "balanced",
    tone: "professional",
    style: "detailed",
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
  sessionsRemaining: 3,
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
  updateSettings: (newSettings: Partial<typeof defaultSettings>) => void;
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
          set({ loading: true });

          try {
            const userRef = doc(db, `users/${user.uid}`);
            const snapshot = await getDoc(userRef);

            if (snapshot.exists()) {
              const userData = snapshot.data();

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
              const newMembership: MembershipDetails = {
                type: "trial",
                status: "active",
                startDate: Timestamp.now(),
                endDate: Timestamp.fromDate(
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ),
                sessionsRemaining: 3,
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

              await setDoc(userRef, newUser);
              set({
                dbUser: newUser,
                settings: defaultSettings,
                membership: newMembership,
              });
            }
          } catch (error) {
            console.error("Failed to initialize auth store", error);
          } finally {
            set({ loading: false });
          }
        },

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: {
              summary: { ...state.settings.summary, ...newSettings.summary },
              chat: { ...state.settings.chat, ...newSettings.chat },
            },
            dbUser: {
              ...state.dbUser,
              settings: {
                ...state.settings,
                ...newSettings,
              },
            },
          })),

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
