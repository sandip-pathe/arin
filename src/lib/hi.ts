export const DEBUG_PERF = process.env.NEXT_PUBLIC_DEBUG_PERF === "true";

const timers: Record<string, number> = {};

const shouldLogPerf = process.env.NODE_ENV !== "production" || DEBUG_PERF;

/**
 * Logs only in development unless you override
 */
export function logPerf(message: string, data?: unknown, force = false) {
  if (!force && !shouldLogPerf) return;

  const time = new Date().toISOString();
  if (data) {
    console.log(`[PERF] ${time} - ${message}`, data);
  } else {
    console.log(`[PERF] ${time} - ${message}`);
  }
}

/**
 * Start a timer with a label
 */
export function startTimer(label: string) {
  if (!shouldLogPerf) return label;
  timers[label] = performance.now();
  logPerf(`Starting: ${label}`);
  return label;
}

/**
 * End a timer and log the duration
 */
export function endTimer(label: string) {
  if (!shouldLogPerf) return;
  const start = timers[label];
  if (start) {
    const duration = performance.now() - start;
    logPerf(`Completed: ${label} in ${duration.toFixed(2)}ms`);
    delete timers[label];
  } else {
    logPerf(`No start time for ${label}`);
  }
}
