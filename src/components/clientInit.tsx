"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { useInitUserData } from "@/hooks/use-init-user-data";

export const ClientInit = () => {
  const { firebaseUser, loading } = useInitUserData();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const open = useAuthModalStore((s) => s.open);

  useEffect(() => {
    console.log("firebase user", firebaseUser);
    if (loading) return;
    console.log("pathname", loading);

    const referredBy = searchParams.get("referredBy");

    // If no user and came with referral → open signup
    if (!firebaseUser && referredBy) {
      console.log("firebase user", firebaseUser);
      open("signup");
      localStorage.setItem("referrer", referredBy);
      return;
    }

    if (!firebaseUser) {
      open("login");
    }
  }, [firebaseUser, loading, pathname, searchParams, open]);

  return null;
};
