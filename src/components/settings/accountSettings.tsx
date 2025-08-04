// AccountSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FiUser, FiMail, FiPhone, FiSend } from "react-icons/fi";
import { useAuth } from "@/contexts/auth-context";
import { getFirestore, doc, updateDoc, Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { signOut, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export const AccountSettings = ({
  isOpen,
  isOpenChange,
}: {
  isOpen: boolean;
  isOpenChange: (open: boolean) => void;
}) => {
  const { dbUser, membership, updateMembership } = useAuth();
  const [name, setName] = useState<string>(dbUser?.displayName || "");
  const [contact, setContact] = useState<string>(dbUser?.phoneNumber || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Sync props -> state when dbUser updates
  useEffect(() => {
    setName(dbUser?.displayName || "");
    setContact(dbUser?.phoneNumber || "");
  }, [dbUser]);

  const handleSave = async () => {
    if (!dbUser?.uid) return;
    if (saving) return;
    setSaving(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", dbUser.uid);
      const updates: any = {
        displayName: name,
        phoneNumber: contact,
      };
      await updateDoc(userRef, updates);

      // Also update auth profile if different
      if (auth.currentUser) {
        const toUpdate: any = {};
        if (name && name !== auth.currentUser.displayName) {
          toUpdate.displayName = name;
        }
        if (Object.keys(toUpdate).length) {
          await updateProfile(auth.currentUser, toUpdate);
        }
      }

      console.log("Account info updated in Firestore:", { name, contact });
      // Optionally you could refresh local user context here if needed
    } catch (error) {
      console.error("Error updating account info:", error);
    } finally {
      setSaving(false);
      isOpenChange(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      isOpenChange(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "—";
    try {
      // Firestore Timestamp
      if (ts.toDate) {
        return ts.toDate().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      // ISO/string fallback
      return new Date(ts).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpenChange}>
      <DialogTitle className="sr-only">
        Account settings & membership
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none rounded-3xl border-none overflow-hidden">
        <div className="relative bg-white rounded-3xl shadow-lg h-full p-8 flex flex-col">
          <div className="flex-1 overflow-auto">
            <div className="pt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="border-0 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Account Settings
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FiUser className="text-indigo-500" />
                          Name
                        </Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FiPhone className="text-green-500" />
                          Contact Number
                        </Label>
                        <Input
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FiMail className="text-blue-500" />
                        Email
                      </Label>
                      <p>{dbUser?.email || "—"}</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handleLogout}
                        className="text-red-500 bg-transparent hover:underline"
                      >
                        Logout
                      </button>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center">
                    <div>{/* Could put last updated / hint here */}</div>
                    <Button
                      onClick={handleSave}
                      disabled={
                        saving ||
                        (name === dbUser?.displayName &&
                          contact === dbUser?.phoneNumber)
                      }
                    >
                      <FiSend className="mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Membership card */}
                <Card className="border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Membership Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="font-medium">Type</div>
                        <div className="text-sm capitalize">
                          {membership?.type || "—"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Status</div>
                        <div className="text-sm capitalize">
                          {membership?.status || "—"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Start Date</div>
                        <div className="text-sm">
                          {formatDate(membership?.startDate)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">End Date</div>
                        <div className="text-sm">
                          {formatDate(membership?.endDate)}
                        </div>
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <div className="font-medium">Sessions Remaining</div>
                        <div className="text-sm">
                          {membership?.sessionsRemaining ?? "—"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    {/* Future actions: upgrade / renew / use session */}
                    <div className="text-xs text-gray-500">
                      {membership?.status === "active"
                        ? `Expires on ${formatDate(membership?.endDate)}`
                        : membership?.status === "pending"
                        ? "Membership pending activation"
                        : "Membership inactive"}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
