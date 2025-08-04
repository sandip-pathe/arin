// AccountSettings.tsx
"use client";

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
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { SummarySettings } from "./summarySettings";
import { ChatSettings } from "./chatSettings";

export const AccountSettings = ({
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
        <div className="relative bg-white rounded-3xl shadow-lg h-full p-8 flex flex-col">
          <SummarySettings />
        </div>
      </DialogContent>
    </Dialog>
  );
};
