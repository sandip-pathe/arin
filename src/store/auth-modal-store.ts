// store/auth-modal-store.ts
import { create } from "zustand";

type ModalType = "login" | "signup" | null;

interface AuthModalState {
  type: ModalType;
  isOpen: boolean;
  open: (type: ModalType) => void;
  close: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  type: null,
  isOpen: false,
  open: (type) => set({ type, isOpen: true }),
  close: () => set({ type: null, isOpen: false }),
}));
