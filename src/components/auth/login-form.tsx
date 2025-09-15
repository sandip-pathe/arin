"use client";

import { useState } from "react";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { auth } from "@/lib/firebase"; // adjust to your firebase setup
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const { open, close } = useAuthModalStore();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      useAuthModalStore.getState().close();
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-primary text-white rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <button
          type="button"
          className="underline"
          onClick={() => open("signup")}
        >
          Register
        </button>
      </p>
    </form>
  );
}
