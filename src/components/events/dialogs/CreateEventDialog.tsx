
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const CreateEventDialog: React.FC = () => {
  const { currentUser } = useAuth();
  const { createEvent } = useData();
  const isAdmin = currentUser?.isAdmin;

  const [newEvent, setNewEvent] = useState({
    name: '',
    date: new Date(),
    startTime: '08:00',
    endTime: '09:00',
    location: '',
    description: '',
  });

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.location) {
      toast.error("Error", {
        description: "Please fill in all required fields"
      });
      return;
    }

    createEvent({
      name: newEvent.name,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      description: newEvent.description || '',
      createdBy: currentUser?.id || '',
      isApproved: isAdmin ? true : false,
      isFeatured: false,
      isPresentationMeeting: false,
      createdAt: new Date()
    });
    
    setNewEvent({
      name: '',
      date: new Date(),
      startTime: '08:00',
      endTime: '09:00',
      location: '',
      description: '',
    });

    toast.success(isAdmin ? "Event created" : "Event submitted for approval", {
      description: isAdmin 
        ? "The event has been created successfully" 
        : "Your event has been submitted and is pending approval",
    });
  };

  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogDescription>
          Enter the details for the new event. {!isAdmin && "Your event will need approval before it's published."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name*
          </Label>
          <Input
            id="name"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Date*
          </Label>
          <div className="col-span-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(newEvent.date, "EEEE, MMMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newEvent.date}
                  onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                  className="rounded-md border pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startTime" className="text-right">
            Start Time*
          </Label>
          <Input
            id="startTime"
            type="time"
            value={newEvent.startTime}
            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endTime" className="text-right">
            End Time*
          </Label>
          <Input
            id="endTime"
            type="time"
            value={newEvent.endTime}
            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            Location*
          </Label>
          <Input
            id="location"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleCreateEvent} className="bg-maroon hover:bg-maroon/90">
          {isAdmin ? "Create Event" : "Submit for Approval"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateEventDialog;
