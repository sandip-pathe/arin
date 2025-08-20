export const DEBUG_PERF = process.env.NEXT_PUBLIC_DEBUG_PERF === "true";
const activeTimers = new Map<string, number>();

export function logPerf(message: string, metadata?: any) {
  if (DEBUG_PERF) {
    console.log(`[PERF] ${new Date().toISOString()} - ${message}`, metadata);
  }
}

export function startTimer(label: string): string {
  if (!DEBUG_PERF) return label;

  const uniqueLabel = `${label}_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  activeTimers.set(uniqueLabel, performance.now());

  if (DEBUG_PERF) {
    console.log(`[PERF] ${new Date().toISOString()} - Starting: ${label}`);
  }

  return uniqueLabel;
}

export function endTimer(label: string) {
  if (!DEBUG_PERF) return;

  const startTime = activeTimers.get(label);
  if (startTime) {
    const duration = performance.now() - startTime;
    console.log(
      `[PERF] ${new Date().toISOString()} - Completed: ${
        label.split("_")[0]
      } in ${duration.toFixed(2)}ms`
    );
    activeTimers.delete(label);
  }
}
