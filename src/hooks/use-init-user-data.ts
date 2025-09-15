"use client";

import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  defaultMembership,
  defaultSettings,
  useAuthStore,
} from "@/store/auth-store";
import type { User as FirebaseUser } from "firebase/auth";

// Utility: creates a default user object for Firestore
const createDefaultUser = (firebaseUser: FirebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  phoneNumber: firebaseUser.phoneNumber,
  settings: defaultSettings,
  membership: {
    ...defaultMembership,
    status: defaultMembership.status ?? "active",
    startDate: Timestamp.now(),
    endDate: Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
    ),
  },
});

export const useInitUserData = () => {
  const [firebaseUser, loading, error] = useAuthState(auth);
  const {
    setUser,
    setDbUser,
    updateSettings,
    updateMembership,
    resetAuth,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (!firebaseUser) {
      resetAuth();
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        const userRef = doc(db, `users/${firebaseUser.uid}`);
        const snapshot = await getDoc(userRef);
        if (cancelled) return;

        if (snapshot.exists()) {
          const userData = snapshot.data();
          setUser(firebaseUser);
          setDbUser(userData);

          if (userData.settings) updateSettings(userData.settings);
          if (userData.membership) updateMembership(userData.membership);
        } else {
          const newUser = createDefaultUser(firebaseUser);
          await setDoc(userRef, newUser);

          setUser(firebaseUser);
          setDbUser(newUser);
          updateSettings(defaultSettings);
          updateMembership(newUser.membership);
        }
      } catch (err) {
        console.error("❌ Failed to initialize user data:", err);
      } finally {
        setLoading(false); // ✅ always clear loader
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, loading]);

  if (error) {
    console.warn("Firebase Auth error:", error);
  }

  return { firebaseUser, loading, error };
};
