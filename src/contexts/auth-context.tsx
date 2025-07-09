'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Logo from '@/components/logo';


interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: any;
  dbUser: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);
  const [dbUser, setDbUser] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, `users/${user.uid}`);
      getDoc(userRef).then(async (snapshot) => {
        if (snapshot.exists()) {
          setDbUser(snapshot.data());
        } else {
          const newUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          };
          await setDoc(userRef, newUser);
          setDbUser(newUser);
        }
      });
    } else {
      setDbUser(null);
    }
  }, [user]);
  
  const value = { user, loading, error, dbUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
