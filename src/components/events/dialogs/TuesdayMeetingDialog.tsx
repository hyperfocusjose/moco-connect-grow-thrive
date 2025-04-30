
import React from 'react';
import { format } from 'date-fns';
import { Event as EventType, User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TuesdayMeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tuesdayMeetingDialog: EventType | null;
  setTuesdayMeetingDialog: (event: EventType | null) => void;
  users: User[];
  onUpdateMeeting: (event: EventType) => void;
}

const TuesdayMeetingDialog: React.FC<TuesdayMeetingDialogProps> = ({
  isOpen,
  onOpenChange,
  tuesdayMeetingDialog,
  setTuesdayMeetingDialog,
  users,
  onUpdateMeeting,
}) => {
  if (!tuesdayMeetingDialog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Manage Tuesday Meeting</DialogTitle>
          <DialogDescription>
            {format(new Date(tuesdayMeetingDialog.date), "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPresentationMeeting"
              checked={tuesdayMeetingDialog.isPresentationMeeting || false}
              onChange={(e) => {
                setTuesdayMeetingDialog({
                  ...tuesdayMeetingDialog,
                  isPresentationMeeting: e.target.checked,
                  presenter: e.target.checked ? tuesdayMeetingDialog.presenter : undefined
                });
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isPresentationMeeting">This is a presentation meeting</Label>
          </div>
          
          {tuesdayMeetingDialog.isPresentationMeeting && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="presenter" className="text-right">
                Presenter
              </Label>
              <Select
                value={tuesdayMeetingDialog.presenter || ""}
                onValueChange={(value) => setTuesdayMeetingDialog({
                  ...tuesdayMeetingDialog,
                  presenter: value
                })}
              >
                <SelectTrigger id="presenter" className="col-span-3">
                  <SelectValue placeholder="Select presenter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No presenter</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={() => onUpdateMeeting(tuesdayMeetingDialog)} 
            className="bg-maroon hover:bg-maroon/90"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TuesdayMeetingDialog;
