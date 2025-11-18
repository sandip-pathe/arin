"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { useInitUserData } from "@/hooks/use-init-user-data";

export const ClientInit = () => {
  const { firebaseUser, loading } = useInitUserData();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { open, resetAnonymousCount } = useAuthModalStore();

  useEffect(() => {
    if (loading) return;

    const referredBy = searchParams.get("referredBy");

    // If user logs in, reset anonymous session count
    if (firebaseUser) {
      resetAnonymousCount();
      return;
    }

    // If no user and came with referral → open signup (optional)
    if (!firebaseUser && referredBy) {
      localStorage.setItem("referrer", referredBy);
      // Don't force login, just store referral
    }

    // Allow anonymous browsing - no forced login!
    // User can explore the app and will be prompted when they try to:
    // - Download results
    // - Save summaries
    // - Share with others
    // - After processing 3 documents
  }, [
    firebaseUser,
    loading,
    pathname,
    searchParams,
    open,
    resetAnonymousCount,
  ]);

  return null;
};
