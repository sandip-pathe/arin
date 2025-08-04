"use client";

import { useInitUserData } from "@/hooks/use-init-user-data";

export default function ClientInit() {
  useInitUserData();
  return null;
}
