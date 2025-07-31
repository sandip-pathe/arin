import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Modal Title</DialogTitle>
      <DialogContent className="max-w-5xl h-[90dvh] overflow-hidden">
        {children}
      </DialogContent>
    </Dialog>
  );
}
