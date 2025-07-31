"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";

// Enhanced membership types
export type MembershipType = "trial" | "plus" | "pro" | "enterprise";
export type MembershipStatus = "active" | "expired" | "pending";

interface MembershipDetails {
  type: MembershipType;
  status: MembershipStatus;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  lastDiscount?: {
    code: string;
    amount: number;
  };
  sessionsRemaining?: number;
}

// Default settings structure
const defaultSettings = {
  summary: {
    length: "medium",
    complexity: "balanced",
    tone: "professional",
    style: "detailed",
  },
  chat: {
    conversationStyle: "balanced",
    responseLength: "medium",
    autoSuggestions: true,
  },
};

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: any;
  dbUser: any | null;
  settings: typeof defaultSettings;
  membership: MembershipDetails;
  updateSettings: (
    newSettings: Partial<typeof defaultSettings>
  ) => Promise<void>;
  updateMembership: (
    newMembership: Partial<MembershipDetails>
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [membership, setMembership] = useState<MembershipDetails>({
    type: "trial",
    status: "pending",
    startDate: null,
    endDate: null,
    sessionsRemaining: 3,
  });

  // Fetch user and settings from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, `users/${user.uid}`);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.data();
          setDbUser(userData);

          // Update membership
          if (userData.membership) {
            setMembership(userData.membership);
          }

          // Merge saved settings with defaults
          if (userData.settings) {
            setSettings({
              summary: {
                ...defaultSettings.summary,
                ...userData.settings.summary,
              },
              chat: { ...defaultSettings.chat, ...userData.settings.chat },
            });
          }
        } else {
          // Create new user with default settings
          const newUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            settings: defaultSettings,
            membership: {
              type: "trial",
              status: "active",
              startDate: Timestamp.now(),
              endDate: Timestamp.fromDate(
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
              ),
              sessionsRemaining: 3,
            },
          };

          await setDoc(userRef, newUser);
          setDbUser(newUser);
          setSettings(defaultSettings);
          setMembership(newUser.membership as MembershipDetails);
        }
      } else {
        setDbUser(null);
        setSettings(defaultSettings);
        setMembership({
          type: "trial",
          status: "pending",
          startDate: null,
          endDate: null,
          sessionsRemaining: 3,
        });
      }
    };

    fetchUserData();
  }, [user]);

  const updateMembership = useCallback(
    async (newMembership: Partial<MembershipDetails>) => {
      if (!user) return;

      try {
        const userRef = doc(db, `users/${user.uid}`);
        const updatedMembership = {
          ...membership,
          ...newMembership,
        };

        await updateDoc(userRef, {
          membership: updatedMembership,
        });

        setMembership(updatedMembership);
        setDbUser((prev: any) => ({
          ...prev,
          membership: updatedMembership,
        }));
      } catch (error) {
        console.error("Error updating membership:", error);
      }
    },
    [user, membership]
  );

  // Update settings in Firestore and local state
  const updateSettings = useCallback(
    async (newSettings: Partial<typeof defaultSettings>) => {
      if (!user) return;

      const updatedSettings = {
        ...settings,
        ...newSettings,
      };

      try {
        const userRef = doc(db, `users/${user.uid}`);
        await updateDoc(userRef, {
          settings: updatedSettings,
        });

        setSettings(updatedSettings);
        setDbUser((prev: any) => ({
          ...prev,
          settings: updatedSettings,
        }));
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    },
    [user, settings]
  );

  const value = {
    user,
    loading,
    error,
    dbUser,
    settings,
    membership,
    updateMembership,
    updateSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
