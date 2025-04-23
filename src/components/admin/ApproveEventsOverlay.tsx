
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ApproveEventsOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const ApproveEventsOverlay: React.FC<ApproveEventsOverlayProps> = ({
  open, onClose
}) => {
  const [pendingEvents, setPendingEvents] = useState([
    { id: 1, name: "Spring Social", date: "2025-05-02", requestedBy: "Alex" },
    { id: 2, name: "Fundraiser", date: "2025-05-10", requestedBy: "Sam" },
  ]);

  const approveEvent = (id: number) => {
    setPendingEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Pending Event Approvals</DialogTitle>
          <DialogDescription>Approve or reject pending group event submissions.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[48vh] pr-2 mb-4">
          {pendingEvents.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No pending events.</div>
          ) : (
            <ul className="space-y-4">
              {pendingEvents.map((event) => (
                <li key={event.id} className="p-4 rounded border flex flex-col md:flex-row gap-2 justify-between items-center bg-muted">
                  <div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-xs text-gray-500">Requested by {event.requestedBy} &middot; {event.date}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-maroon hover:bg-maroon/90" onClick={() => approveEvent(event.id)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => approveEvent(event.id)}>Reject</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="flex justify-end mt-2">
          <DialogClose asChild>
            <Button className="bg-maroon hover:bg-maroon/90" onClick={onClose}>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
