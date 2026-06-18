"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";

export const LocalExportModal = ({
  sessionId,
  isOpen,
  onOpenChange,
}: {
  sessionId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const router = useRouter();

  const openSession = () => {
    onOpenChange(false);
    if (sessionId) router.push(`/s/${sessionId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Export private session</DialogTitle>
      <DialogContent className="w-full h-full max-w-none max-h-none rounded-none md:max-w-2xl md:h-auto md:rounded-3xl p-0 bg-transparent shadow-none border-none overflow-hidden">
        <div className="relative bg-white md:rounded-3xl shadow-lg h-full p-4 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="m-auto shadow-none border-neutral-200">
              <CardHeader>
                <CardTitle>Export Local Session</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-sm text-neutral-600">
                  This session is stored in this browser. Open it to download a
                  PDF, Markdown file, text summary, or chat transcript.
                </p>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="rounded-lg"
                  >
                    Close
                  </Button>
                  <Button onClick={openSession} className="rounded-lg gap-2">
                    <FiDownload size={16} />
                    Open to Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
