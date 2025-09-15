"use client";

import { useGATracking } from "@/hooks/useGATracking";

export default function AnalyticsWrapper() {
  useGATracking();
  return null;
}
