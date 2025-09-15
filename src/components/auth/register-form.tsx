"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthModalStore } from "@/store/auth-modal-store";

export default function SignupForm() {
  const { toast } = useToast();
  const { open, close } = useAuthModalStore();
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("referredBy"); // 👈 read from URL

  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Create user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create Firestore user doc
      await setDoc(doc(db, "users", user.uid), {
        email,
        name: fname,
        referredBy: referredBy || null,
        referralCount: 0,
        createdAt: new Date(),
      });

      // If referred, update referrer's referralCount + add referral record
      if (referredBy) {
        const referrerDoc = doc(db, "users", referredBy);

        // increment counter
        await updateDoc(referrerDoc, { referralCount: increment(1) });

        // add to subcollection
        await addDoc(collection(referrerDoc, "referrals"), {
          referredUserId: user.uid,
          email,
          createdAt: new Date(),
        });
      }

      close();
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={fname}
          onChange={(e) => setFname(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <button
          type="button"
          className="underline"
          onClick={() => open("login")}
        >
          Login
        </button>
      </p>
    </form>
  );
}
