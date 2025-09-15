export const DEBUG_PERF = process.env.NEXT_PUBLIC_DEBUG_PERF === "true";

let timers: Record<string, number> = {};

const isProd = process.env.NEXT_PUBLIC_DEBUG_PERF === "true";

/**
 * Logs only in development unless you override
 */
export function logPerf(message: string, data?: unknown, force = false) {
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
  if (isProd) return label; // noop in prod
  timers[label] = performance.now();
  logPerf(`Starting: ${label}`);
  return label;
}

/**
 * End a timer and log the duration
 */
export function endTimer(label: string) {
  if (isProd) return;
  const start = timers[label];
  if (start) {
    const duration = performance.now() - start;
    logPerf(`Completed: ${label} in ${duration.toFixed(2)}ms`);
    delete timers[label];
  } else {
    logPerf(`No start time for ${label}`);
  }
}
