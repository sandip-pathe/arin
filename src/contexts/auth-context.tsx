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

interface MembershipDetails {
  type: "trial" | "plus" | "pro" | "enterprise";
  status: "active" | "expired" | "pending";
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

  // Fetch user and settings from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, `users/${user.uid}`);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.data();
          setDbUser(userData);

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
          };

          await setDoc(userRef, newUser);
          setDbUser(newUser);
          setSettings(defaultSettings);
        }
      } else {
        setDbUser(null);
        setSettings(defaultSettings);
      }
    };

    fetchUserData();
  }, [user]);

  const updateMembership = useCallback(
    async (newMembership: Partial<MembershipDetails>) => {
      if (!user) return;

      try {
        const userRef = doc(db, `users/${user.uid}`);
        await updateDoc(userRef, {
          membership: {
            ...dbUser?.membership,
            ...newMembership,
          },
        });

        setDbUser((prev: any) => ({
          ...prev,
          membership: {
            ...prev.membership,
            ...newMembership,
          },
        }));
      } catch (error) {
        console.error("Error updating membership:", error);
      }
    },
    [user, dbUser]
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
