import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

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
  settings: typeof defaultSettings;
  membership: MembershipDetails;

  setUser: (user: User | null | undefined) => void;
  setDbUser: (data: any) => void;
  updateSettings: (newSettings: Partial<typeof defaultSettings>) => void;
  updateMembership: (newMembership: Partial<MembershipDetails>) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        dbUser: null,
        settings: defaultSettings,
        membership: defaultMembership,

        setUser: (user) => set({ user }),
        setDbUser: (data) => set({ dbUser: data }),
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
