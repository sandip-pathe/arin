"use client";

import { useState } from "react";
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
  const referredBy = searchParams.get("referredBy");
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", user.uid), {
        email,
        displayName: fname,
        referredBy: referredBy || null,
        referralCount: 0,
        createdAt: new Date(),
      });

      localStorage.setItem(`greetingCount_${user.uid}`, "1");
      if (referredBy) {
        const referrerDoc = doc(db, "users", referredBy);
        await updateDoc(referrerDoc, { referralCount: increment(1) });
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
