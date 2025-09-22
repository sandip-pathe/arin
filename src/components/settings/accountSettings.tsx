// AccountSettings.tsx
"use client";

import { useEffect, useState } from "react";
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
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { updateProfile, signOut } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    setName(dbUser?.displayName || "");
    setContact(dbUser?.phoneNumber || "");
  }, [dbUser]);

  const norm = (v?: string | null) => (v ?? "").toString().trim();
  const isUnchanged =
    norm(name) === norm(dbUser?.displayName) &&
    norm(contact) === norm(dbUser?.phoneNumber);

  const handleSave = async () => {
    if (saving) return;

    const uid = dbUser?.uid || auth.currentUser?.uid;
    if (!uid || isUnchanged) return;

    setSaving(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", uid);

      await setDoc(
        userRef,
        {
          displayName: name || null,
          phoneNumber: contact || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (auth.currentUser && name && name !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        useAuthStore.getState().setDbUser({
          ...snapshot.data(),
          uid,
        });
      }
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose?.();
  };

  const handleDeleteAccount = async () => {
    const uid = dbUser?.uid || auth.currentUser?.uid;
    if (!uid) return;

    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    await setDoc(
      userRef,
      { deleted: true, deletedAt: serverTimestamp() },
      { merge: true }
    );

    await signOut(auth);
    onClose?.();
  };

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
            <AlertDialog
              open={logoutDialogOpen}
              onOpenChange={setLogoutDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-4 py-2 transition-colors bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                >
                  Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log Out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out? You can log back in at any
                    time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-gray-600 text-white hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
                    cannot be undone.
                    <span className="hover:underline cursor-pointer text-blue-600">
                      {" "}
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
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || isUnchanged}
          >
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
      <DialogDescription className="sr-only">
        Update your account settings and membership details.
      </DialogDescription>
      <DialogContent className="w-full h-full max-w-none max-h-none rounded-none md:max-w-4xl md:h-[90dvh] md:rounded-3xl p-0 bg-transparent shadow-none border-none overflow-hidden">
        <div className="relative bg-white md:rounded-3xl shadow-lg h-full p-4 md:p-8 flex flex-col overflow-auto">
          <AccountSettings onClose={() => isOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
