import { create } from "zustand";

interface ReferralState {
  referredBy: string | null;
  setReferredBy: (id: string | null) => void;
}

export const useReferralStore = create<ReferralState>((set) => ({
  referredBy: null,
  setReferredBy: (id) => set({ referredBy: id }),
}));
