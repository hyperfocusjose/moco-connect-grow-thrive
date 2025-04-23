
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import WeeklyReport from "@/pages/Reports";

interface WeeklyReportOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const WeeklyReportOverlay: React.FC<WeeklyReportOverlayProps> = ({
  open, onClose
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Weekly Report</DialogTitle>
        <DialogDescription>
          Most recent weekly report below.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <WeeklyReport />
      </ScrollArea>
      <div className="flex justify-end mt-4">
        <DialogClose asChild>
          <Button className="bg-maroon hover:bg-maroon/90">Close</Button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
);
