// store/auth-modal-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ModalType = "login" | "signup" | null;
type LoginTrigger =
  | "download"
  | "save"
  | "share"
  | "limit_reached"
  | "premium_feature"
  | "manual"
  | null;

interface AuthModalState {
  type: ModalType;
  isOpen: boolean;
  trigger: LoginTrigger;
  anonymousSessionCount: number;
  open: (type: ModalType, trigger?: LoginTrigger) => void;
  close: () => void;
  incrementAnonymousSession: () => void;
  resetAnonymousCount: () => void;
}

export const useAuthModalStore = create<AuthModalState>()(
  persist(
    (set) => ({
      type: null,
      isOpen: false,
      trigger: null,
      anonymousSessionCount: 0,
      open: (type, trigger = "manual") => set({ type, isOpen: true, trigger }),
      close: () => set({ type: null, isOpen: false, trigger: null }),
      incrementAnonymousSession: () =>
        set((state) => ({
          anonymousSessionCount: state.anonymousSessionCount + 1,
        })),
      resetAnonymousCount: () => set({ anonymousSessionCount: 0 }),
    }),
    {
      name: "auth-modal-storage",
      partialize: (state) => ({
        anonymousSessionCount: state.anonymousSessionCount,
      }),
    }
  )
);
