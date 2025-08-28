"use client";
import { usePathname } from "next/navigation";
import { useInitUserData } from "@/hooks/use-init-user-data";

export default function ClientInit() {
  const pathname = usePathname();

  // ✅ Public routes (no auth required)
  const publicRoutes = ["/login", "/signup"];

  const requireAuth = !publicRoutes.includes(pathname);

  useInitUserData(requireAuth);

  return null;
}
