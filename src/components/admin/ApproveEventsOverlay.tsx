
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";

interface ApproveEventsOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const ApproveEventsOverlay: React.FC<ApproveEventsOverlayProps> = ({
  open, onClose
}) => {
  const { events, updateEvent, getUser } = useData();
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);

  useEffect(() => {
    // Filter unapproved events
    const unapproved = events
      .filter(event => !event.isApproved && !event.isCancelled)
      .map(event => {
        const requestedBy = event.createdBy ? getUser(event.createdBy)?.firstName || "Unknown" : "Unknown";
        return {
          id: event.id,
          name: event.name,
          date: format(new Date(event.date), 'yyyy-MM-dd'),
          requestedBy
        };
      });

    setPendingEvents(unapproved);
  }, [events, getUser]);

  const approveEvent = async (id: string) => {
    try {
      await updateEvent(id, { isApproved: true });
      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  const rejectEvent = async (id: string) => {
    try {
      await updateEvent(id, { isCancelled: true });
      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error rejecting event:", error);
    }
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
                    <Button size="sm" variant="outline" onClick={() => rejectEvent(event.id)}>Reject</Button>
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
