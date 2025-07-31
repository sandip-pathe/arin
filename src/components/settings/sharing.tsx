"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { motion } from "framer-motion";

export const ShareModal = ({
  sessionId,
  isOpen,
  onOpenChange,
}: {
  sessionId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email to share with.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "sessions", sessionId), {
        shares: arrayUnion({
          recipient: email,
          createdAt: new Date(),
        }),
      });

      const link = `${window.location.origin}/${sessionId}`;
      setShareLink(link);

      toast({
        title: "Shared successfully",
        description: `Link sent to ${email}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to share session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">
        Welcome to Legal AI Assistant
      </DialogTitle>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none rounded-3xl border-none overflow-hidden">
        <div className="relative bg-white rounded-3xl shadow-lg h-full p-8">
          <div className="pt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="m-auto h-1/2">
                <CardHeader>
                  <CardTitle>Share Session</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {!shareLink ? (
                    <>
                      <div>
                        <Label htmlFor="email">Recipient Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="e.g. partner@law.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <Button
                        disabled={loading || !email}
                        onClick={handleShare}
                        className="w-full"
                      >
                        {loading ? "Sharing..." : "Share"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Label>Shareable Link</Label>
                      <div className="flex gap-2 items-center">
                        <Input readOnly value={shareLink} className="flex-1" />
                        <Button
                          onClick={copyToClipboard}
                          variant="outline"
                          className="w-12"
                        >
                          {copied ? (
                            <FiCheck className="text-green-600" />
                          ) : (
                            <FiCopy />
                          )}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        className="mt-2 text-sm underline"
                        onClick={() => {
                          setShareLink("");
                          setEmail("");
                        }}
                      >
                        Share another
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
