// AccountSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiPhone, FiSend } from "react-icons/fi";
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
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { updateProfile, signOut } from "firebase/auth";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const AccountSettings = ({ onClose }: { onClose?: () => void }) => {
  const { dbUser } = useAuthStore();
  const [name, setName] = useState<string>(dbUser?.displayName || "");
  const [contact, setContact] = useState<string>(dbUser?.phoneNumber || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setName(dbUser?.displayName || "");
    setContact(dbUser?.phoneNumber || "");
  }, [dbUser]);

  const handleSave = async () => {
    if (!dbUser?.uid || saving) return;

    setSaving(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", dbUser.uid);
      await updateDoc(userRef, {
        displayName: name,
        phoneNumber: contact,
      });

      if (auth.currentUser) {
        const toUpdate: Partial<{ displayName: string }> = {};
        if (name && name !== auth.currentUser.displayName) {
          toUpdate.displayName = name;
        }
        if (Object.keys(toUpdate).length > 0) {
          await updateProfile(auth.currentUser, toUpdate);
        }
      }

      console.log("Account info updated:", { name, contact });
    } catch (error) {
      console.error("Error updating account info:", error);
    } finally {
      setSaving(false);
      onClose?.();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose?.();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!dbUser?.uid) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, "users", dbUser.uid);
      await updateDoc(userRef, { deleted: true });

      await signOut(auth);
      onClose?.();
      router.push("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const isUnchanged =
    name === dbUser?.displayName && contact === dbUser?.phoneNumber;

  return (
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

          <div className="w-full space-x-2 space-y-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-full px-4 py-2 transition-colors bg-white text-gray-700 hover:bg-blue-600 hover:text-white text-lg"
            >
              Logout
            </Button>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 transition-colors bg-white text-red-500 hover:bg-red-600 hover:text-white"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account? This action
                    cannot be undone. All your content will be lost and cannot
                    be retrieved.{" "}
                    <span className="hover:underline cursor-pointer text-blue-600">
                      Read our data policy
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div>{/* Optional last updated / timestamp info */}</div>
          <Button onClick={handleSave} disabled={saving || isUnchanged}>
            <FiSend className="mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export const AccountSettingsModal = ({
  isOpen,
  isOpenChange,
}: {
  isOpen: boolean;
  isOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={isOpenChange}>
      <DialogTitle className="sr-only">
        Account settings & membership
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none rounded-3xl border-none overflow-hidden">
        <div className="relative bg-white rounded-3xl shadow-lg h-full p-8 flex flex-col overflow-auto">
          <AccountSettings onClose={() => isOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
