"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DownloadOptions } from "./summaryDisplay";

type DownloadSummaryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (options: DownloadOptions) => void;
};

export default function DownloadSummaryModal({
  open,
  onOpenChange,
  onDownload,
}: DownloadSummaryModalProps) {
  const [options, setOptions] = useState<DownloadOptions>({
    summary: true,
    keyData: true,
    sources: false,
  });

  const handleOptionChange = (key: keyof DownloadOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="summary"
              checked={options.summary}
              onCheckedChange={() => handleOptionChange("summary")}
            />
            <Label htmlFor="summary">Summary</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="keyData"
              checked={options.keyData}
              onCheckedChange={() => handleOptionChange("keyData")}
            />
            <Label htmlFor="keyData">Key Data</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sources"
              checked={options.sources}
              onCheckedChange={() => handleOptionChange("sources")}
            />
            <Label htmlFor="sources">Source Documents</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onDownload(options)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
