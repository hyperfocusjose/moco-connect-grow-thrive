
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { Event as EventType, User } from "@/types";

type PresenterHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: EventType[];
  getUser: (userId: string) => User | undefined;
};

const PresenterHistoryDialog: React.FC<PresenterHistoryDialogProps> = ({
  open,
  onOpenChange,
  events,
  getUser
}) => {
  // Get presenter history for Tuesday meetings
  const getPresenterHistory = () => {
    return events
      .filter(event =>
        event.name.toLowerCase().includes('tuesday meeting') &&
        event.isPresentationMeeting &&
        event.presenter &&
        isPast(new Date(event.date))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(event => ({
        date: new Date(event.date),
        presenter: getUser(event.presenter || '')
      }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Presenter History</DialogTitle>
          <DialogDescription>
            Past presenters at Tuesday meetings
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {getPresenterHistory().length > 0 ? (
              getPresenterHistory().map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">
                      {item.presenter ? `${item.presenter.firstName} ${item.presenter.lastName}` : 'Unknown presenter'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.presenter?.businessName || ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{format(item.date, "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">No presentation history found</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-maroon hover:bg-maroon/90">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PresenterHistoryDialog;
