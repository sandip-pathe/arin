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

export const useInitUserData = () => {
  const [firebaseUser, loading, error] = useAuthState(auth);

  const { setUser, setDbUser, updateSettings, updateMembership, resetAuth } =
    useAuthStore();

  useEffect(() => {
    if (!firebaseUser) {
      resetAuth();
      return;
    }

    let cancelled = false;

    const init = async () => {
      const userRef = doc(db, `users/${firebaseUser.uid}`);
      const snapshot = await getDoc(userRef);
      if (cancelled) return;

      if (snapshot.exists()) {
        const userData = snapshot.data();
        setUser(firebaseUser);
        setDbUser(userData);

        if (userData.settings) {
          updateSettings(userData.settings);
        }

        if (userData.membership) {
          updateMembership(userData.membership);
        }
      } else {
        const newUser = {
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
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            ),
          },
        };

        await setDoc(userRef, newUser);

        setUser(firebaseUser);
        setDbUser(newUser);
        updateSettings(defaultSettings);
        updateMembership(newUser.membership);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  return { firebaseUser, loading, error };
};
