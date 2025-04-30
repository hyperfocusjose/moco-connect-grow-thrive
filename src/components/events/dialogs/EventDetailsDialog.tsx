
import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, User as UserIcon } from 'lucide-react';
import { Event as EventType, User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventDetails: EventType | null;
  getUser: (id: string) => User | undefined;
  formatTime: (time: string) => string;
  isAdmin: boolean;
  onCancel: (event: EventType) => void;
  onDelete: (id: string) => void;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  eventDetails,
  getUser,
  formatTime,
  isAdmin,
  onCancel,
  onDelete,
}) => {
  if (!eventDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{eventDetails.name}</DialogTitle>
          <DialogDescription>
            {format(new Date(eventDetails.date), "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {formatTime(eventDetails.startTime)} - {formatTime(eventDetails.endTime)}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{eventDetails.location}</span>
          </div>
          {eventDetails.isPresentationMeeting && eventDetails.presenter && (
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                Presenter: {
                  eventDetails.presenter && getUser(eventDetails.presenter) 
                    ? `${getUser(eventDetails.presenter).firstName} ${getUser(eventDetails.presenter).lastName}`
                    : 'Unknown'
                }
              </span>
            </div>
          )}
          {eventDetails.description && (
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-gray-700">{eventDetails.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {eventDetails.isCancelled && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                Cancelled
              </Badge>
            )}
            {!eventDetails.isApproved && !eventDetails.isCancelled && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                Pending Approval
              </Badge>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center">
          <div>
            {isAdmin && !eventDetails.isCancelled && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {eventDetails.name.includes('Tuesday Meeting') ? 'Cancel Meeting' : 'Delete Event'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {eventDetails.name.includes('Tuesday Meeting') 
                        ? "This will cancel the Tuesday meeting. It won't be shown to members."
                        : "This will permanently delete the event and cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        if (eventDetails.name.includes('Tuesday Meeting')) {
                          onCancel(eventDetails);
                        } else {
                          onDelete(eventDetails.id);
                        }
                        onOpenChange(false);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {eventDetails.name.includes('Tuesday Meeting') ? 'Cancel Meeting' : 'Delete Event'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <DialogClose asChild>
            <Button className="bg-maroon hover:bg-maroon/90">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
