import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import useSessionStore from "@/store/session-store";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useAuth } from "@/contexts/auth-context";

export const ShareModal = ({ sessionId }: { sessionId: string }) => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([
    "Summary",
    "Chat",
  ]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { attachments, summaries, context } = useSessionStore();

  const handleShare = async () => {
    if (!email || selectedItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter an email and select items to share.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      // Create share record in Firestore
      const shareRef = await addDoc(collection(db, "shares"), {
        sessionId,
        recipientEmail: email,
        sharedItems: selectedItems,
        sharedBy: user?.uid,
        createdAt: serverTimestamp(),
        accessCount: 0,
        status: "active",
      });

      // Update session document with share reference
      await updateDoc(doc(db, "sessions", sessionId), {
        shares: arrayUnion({
          id: shareRef.id,
          recipient: email,
          createdAt: new Date(),
        }),
      });

      // Generate shareable link
      const link = `${window.location.origin}/shared/${shareRef.id}`;
      setShareLink(link);

      toast({
        title: "Session Shared!",
        description: `Access granted to ${email}`,
      });
    } catch (error) {
      console.error("Sharing failed:", error);
      toast({
        title: "Sharing Failed",
        description: "Could not share session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "Share this link with your recipient",
    });
  };

  const getSharedContentPreview = () => {
    const preview = [];

    if (selectedItems.includes("Summary") && summaries.length > 0) {
      preview.push({
        type: "Summary",
        content: summaries[0].summary.substring(0, 100) + "...",
      });
    }

    if (selectedItems.includes("Chat") && context) {
      preview.push({
        type: "Chat Context",
        content: context.substring(0, 100) + "...",
      });
    }

    if (selectedItems.includes("Source Files") && attachments.length > 0) {
      preview.push({
        type: "Files",
        content: `${attachments.length} file${
          attachments.length > 1 ? "s" : ""
        } attached`,
      });
    }

    return preview;
  };

  return (
    <Card className="max-w-xl shadow-none mx-auto border-none overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">
          Share This Session
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          Securely grant access to colleagues, clients, or legal collaborators.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {!shareLink ? (
            <>
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Recipient Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. paralegal@firm.com"
                  className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {!email && (
                  <span className="text-xs text-red-500">
                    Email is required.
                  </span>
                )}
              </div>

              {/* Content to Share */}
              <div className="space-y-2">
                <Label className="text-gray-700">Select Content to Share</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Only the selected components will be visible to the recipient.
                </p>
                <div className="space-y-3">
                  {["Summary", "Chat", "Source Files"].map((item, idx) => (
                    <motion.label
                      key={item}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={selectedItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item]);
                          } else {
                            setSelectedItems(
                              selectedItems.filter((i) => i !== item)
                            );
                          }
                        }}
                      />
                      <span className="text-gray-800">{item}</span>
                    </motion.label>
                  ))}
                </div>
                {selectedItems.length === 0 && (
                  <span className="text-xs text-red-500">
                    Please select at least one item to share.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <Button
                  className="w-full py-4 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 transition-shadow shadow-sm"
                  disabled={!email || selectedItems.length === 0 || isSharing}
                  onClick={handleShare}
                >
                  {isSharing ? "Sharing..." : "Share Session"}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  The recipient will receive a secure link via email.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Session Shared Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Your recipient can now access the shared content
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <Label className="text-gray-700 mb-2 block">
                  Shareable Link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1 py-2 truncate"
                  />
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="w-12"
                  >
                    {copied ? (
                      <FiCheck className="text-green-600" />
                    ) : (
                      <FiCopy />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This link expires in 7 days
                </p>
              </div>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setShareLink("");
                  setEmail("");
                }}
              >
                Share Another Session
              </Button>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};
