import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { logPerf, startTimer, endTimer } from "./hi";

/**
 * Get anonymous session IDs from localStorage
 */
export const getAnonymousSessionIds = (): string[] => {
  try {
    const stored = localStorage.getItem("anonymousSessions");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading anonymous sessions:", error);
    return [];
  }
};

/**
 * Add session ID to anonymous sessions list
 */
export const addAnonymousSessionId = (sessionId: string): void => {
  try {
    const current = getAnonymousSessionIds();
    if (!current.includes(sessionId)) {
      localStorage.setItem(
        "anonymousSessions",
        JSON.stringify([...current, sessionId])
      );
    }
  } catch (error) {
    console.error("Error saving anonymous session:", error);
  }
};

/**
 * Clear anonymous sessions from localStorage
 */
export const clearAnonymousSessionIds = (): void => {
  try {
    localStorage.removeItem("anonymousSessions");
  } catch (error) {
    console.error("Error clearing anonymous sessions:", error);
  }
};

/**
 * Generate a unique anonymous user ID
 */
export const generateAnonymousUserId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `anon_${timestamp}_${random}`;
};

/**
 * Get or create anonymous user ID from localStorage
 */
export const getAnonymousUserId = (): string => {
  try {
    let anonId = localStorage.getItem("anonymousUserId");
    if (!anonId) {
      anonId = generateAnonymousUserId();
      localStorage.setItem("anonymousUserId", anonId);
    }
    return anonId;
  } catch (error) {
    console.error("Error getting anonymous user ID:", error);
    return generateAnonymousUserId();
  }
};

/**
 * Migrate anonymous sessions to authenticated user
 * This runs when user signs in/up
 */
export const migrateAnonymousSessions = async (
  newUserId: string,
  userEmail: string
): Promise<number> => {
  const migrationTimer = startTimer("SessionMigration");

  try {
    // Get anonymous session IDs from localStorage
    const anonymousSessionIds = getAnonymousSessionIds();

    if (anonymousSessionIds.length === 0) {
      logPerf("No anonymous sessions to migrate");
      endTimer(migrationTimer);
      return 0;
    }

    logPerf("Starting session migration", {
      sessionCount: anonymousSessionIds.length,
      newUserId,
    });

    const batch = writeBatch(db);
    let migratedCount = 0;

    // Migrate each session
    for (const sessionId of anonymousSessionIds) {
      try {
        const sessionRef = doc(db, "sessions", sessionId);
        batch.update(sessionRef, {
          userId: newUserId,
          owner: userEmail,
          createdBy: userEmail,
          updatedAt: serverTimestamp(),
          migratedAt: serverTimestamp(),
          wasAnonymous: true,
        });
        migratedCount++;
      } catch (error) {
        console.error(
          `Error preparing migration for session ${sessionId}:`,
          error
        );
      }
    }

    // Commit all updates
    if (migratedCount > 0) {
      await batch.commit();
      logPerf("Sessions migrated successfully", { migratedCount });
    }

    // Clear localStorage
    clearAnonymousSessionIds();
    localStorage.removeItem("anonymousUserId");

    endTimer(migrationTimer);
    return migratedCount;
  } catch (error) {
    console.error("Error migrating sessions:", error);
    logPerf("Session migration failed", { error });
    endTimer(migrationTimer);
    return 0;
  }
};

/**
 * Check if a session belongs to the current anonymous user
 */
export const isOwnAnonymousSession = (sessionId: string): boolean => {
  const anonymousSessions = getAnonymousSessionIds();
  return anonymousSessions.includes(sessionId);
};
