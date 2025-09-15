// hooks/useGATracking.ts
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useGATracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    (window as any).gtag?.("config", "G-XXXXXXX", {
      page_path: url,
    });
  }, [pathname, searchParams]);
}
