"use client";
import { DEBUG_PERF, logPerf } from "@/lib/hi";
import React, { useMemo, useState, useEffect, useRef } from "react";

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      // Monitor memory usage
      const perfMemory = (performance as any).memory;
      if (perfMemory) {
        setMetrics({
          jsHeapSizeLimit: perfMemory.jsHeapSizeLimit,
          totalJSHeapSize: perfMemory.totalJSHeapSize,
          usedJSHeapSize: perfMemory.usedJSHeapSize,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!DEBUG_PERF) return null;

  return (
    <div className="fixed top-4 right-4 text-white p-2 text-xs opacity-75 z-50">
      <div>
        Memory: {Math.round(metrics.usedJSHeapSize / 1024 / 1024)}MB /{" "}
        {Math.round(metrics.jsHeapSizeLimit / 1024 / 1024)}MB
      </div>
    </div>
  );
}
