import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Event as EventType } from '@/types';
import { AlertCircle, History, Plus, Clock, MapPin, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventsList from '@/components/events/EventsList';
import PendingEventsList from '@/components/events/PendingEventsList';
import EventCalendarView from '@/components/events/EventCalendarView';
import { useAuth } from '@/contexts/AuthContext';
import { format, addMonths, subMonths, addYears, isPast, getDaysInMonth, startOfMonth, endOfMonth, isSameMonth, isSameDay, startOfDay } from 'date-fns';
import { eachTuesdayOfInterval, formatDateForComparison } from '@/utils/dateUtils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PresenterHistoryDialog from '@/components/events/PresenterHistoryDialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

const Events = () => {
  const { events, createEvent, updateEvent, deleteEvent, getUser, users, fetchEvents } = useData();
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [eventDetails, setEventDetails] = useState<EventType | null>(null);
  const [presenterHistoryOpen, setPresenterHistoryOpen] = useState(false);
  const [tuesdayMeetingDialog, setTuesdayMeetingDialog] = useState<EventType | null>(null);
  const [tuesdayMeetingsInitialized, setTuesdayMeetingsInitialized] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: new Date(),
    startTime: '08:00',
    endTime: '09:00',
    location: '',
    description: '',
  });

  useEffect(() => {
    console.log('Events component mounted, fetching events...');
    fetchEvents();
  }, [fetchEvents]);

  const isAdmin = currentUser?.isAdmin;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const isWeeklyMeeting = event.name.toLowerCase().includes('tuesday meeting');
    
    if (isWeeklyMeeting) {
      const uniqueTuesdayMeetingDates = new Map();
      
      events
        .filter(e => 
          e.name.toLowerCase().includes('tuesday meeting') && 
          !e.isCancelled && 
          e.isApproved &&
          new Date(e.date) >= today
        )
        .forEach(meeting => {
          const meetingDate = formatDateForComparison(new Date(meeting.date));
          if (!uniqueTuesdayMeetingDates.has(meetingDate) || meeting.isPresentationMeeting) {
            uniqueTuesdayMeetingDates.set(meetingDate, meeting);
          }
        });
      
      const upcomingTuesdayMeetings = Array.from(uniqueTuesdayMeetingDates.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 2);
      
      return upcomingTuesdayMeetings.some(meeting => meeting.id === event.id);
    }
    
    return eventDate >= today && event.isApproved && !event.isCancelled;
  });

  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const isWeeklyMeeting = event.name.toLowerCase().includes('tuesday meeting');
    return eventDate < today && event.isApproved && !isWeeklyMeeting;
  });

  const myEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return (event.createdBy === currentUser?.id || event.presenter === currentUser?.id) && 
           eventDate >= today;
  });

  const pendingEvents = events.filter(event => !event.isApproved && !event.isCancelled);

  const cancelledEvents = events.filter(event => event.isCancelled === true);

  const filteredEvents = (() => {
    switch (selectedTab) {
      case 'upcoming':
        return upcomingEvents;
      case 'past':
        return pastEvents;
      case 'my-events':
        return myEvents;
      case 'pending':
        return pendingEvents;
      case 'cancelled':
        return cancelledEvents;
      default:
        return [];
    }
  })();

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return selectedTab === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  useEffect(() => {
    if (isAdmin && !tuesdayMeetingsInitialized && events.length > 0) {
      const today = startOfDay(new Date());
      const nextYear = addYears(today, 1);
      
      const futureTuesdays = eachTuesdayOfInterval({
        start: today,
        end: nextYear
      });
      
      const existingTuesdayMeetingDates = new Set(
        events
          .filter(event => event.name.includes('Tuesday Meeting'))
          .map(event => formatDateForComparison(new Date(event.date)))
      );
      
      const missingTuesdays = futureTuesdays.filter(
        tuesday => !existingTuesdayMeetingDates.has(formatDateForComparison(tuesday))
      );
      
      if (missingTuesdays.length > 0) {
        missingTuesdays.forEach(tuesday => {
          createEvent({
            name: 'Tuesday Meeting',
            date: tuesday,
            startTime: '08:00',
            endTime: '09:00',
            location: 'Keller Williams Office, 2201 Lake Woodlands Dr, Spring, TX 77380',
            description: 'Regular weekly meeting for members',
            createdBy: currentUser?.id || 'system',
            isApproved: true,
            isFeatured: false,
            isPresentationMeeting: false,
            createdAt: new Date()
          });
        });
      }
      
      setTuesdayMeetingsInitialized(true);
    }
  }, [isAdmin, events, createEvent, currentUser, tuesdayMeetingsInitialized]);

  const eventsInMonth = events.filter(event => {
    const eventDate = new Date(event.date);
    return isSameMonth(eventDate, currentDate) && event.isApproved;
  });

  const getEventsForDay = (day: Date) => {
    return eventsInMonth.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    });
  };

  const previousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.location) {
      toast.error("Error", {
        description: "Please fill in all required fields"
      });
      return;
    }

    const event: Partial<EventType> = {
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
    };

    createEvent(event);
    
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

  const handleUpdateTuesdayMeeting = (event: EventType) => {
    if (!tuesdayMeetingDialog) return;
    
    const updatedEvent = { 
      ...event,
      isPresentationMeeting: tuesdayMeetingDialog.isPresentationMeeting,
      presenter: tuesdayMeetingDialog.presenter
    };
    
    updateEvent(event.id, updatedEvent);
    
    setTuesdayMeetingDialog(null);
    
    toast.success("Meeting updated", {
      description: updatedEvent.isPresentationMeeting 
        ? "Presenter has been assigned to this meeting" 
        : "Meeting has been updated",
    });
  };

  const handleCancelEvent = (event: EventType) => {
    const updatedEvent = { ...event, isCancelled: true };
    updateEvent(event.id, updatedEvent);
    
    toast.warning("Event cancelled", {
      description: "The event has been cancelled successfully",
    });
  };

  const handleApproveEvent = (event: EventType) => {
    const updatedEvent = { ...event, isApproved: true };
    updateEvent(event.id, updatedEvent);
    
    toast.success("Event approved", {
      description: "The event has been approved successfully",
    });
  };

  const handleDisapproveEvent = (event: EventType) => {
    const updatedEvent = { ...event, isCancelled: true };
    updateEvent(event.id, updatedEvent);
    
    toast.error("Event disapproved", {
      description: "The event has been moved to cancelled events",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    
    toast.success("Event deleted", {
      description: "The event has been deleted permanently",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

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

  const generateCalendarDays = () => {
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const totalDays = getDaysInMonth(currentDate);
    
    const startDay = firstDay.getDay();
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push(day);
    }
    
    return days;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Browse and manage events for MocoPNG</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => setPresenterHistoryOpen(true)}
            >
              <History className="mr-1 h-4 w-4" /> Presenter History
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-maroon hover:bg-maroon/90">
                <Plus className="mr-1 h-4 w-4" /> Create New Event
              </Button>
            </DialogTrigger>
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
          </Dialog>
          
          <div className="border rounded-md p-1">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-maroon hover:bg-maroon/90' : ''}
            >
              List
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-maroon hover:bg-maroon/90' : ''}
            >
              Calendar
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Tabs defaultValue="upcoming" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            {currentUser && <TabsTrigger value="my-events">My Events</TabsTrigger>}
            {isAdmin && <TabsTrigger value="pending">Pending Approval</TabsTrigger>}
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <EventsList 
              events={sortedEvents} 
              getUser={getUser} 
              currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onManageTuesdayMeeting={(event) => setTuesdayMeetingDialog(event)}
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} 
              formatTime={formatTime}
              isAdmin={isAdmin}
            />
          </TabsContent>
          
          <TabsContent value="past">
            <EventsList 
              events={sortedEvents} 
              getUser={getUser} 
              currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onManageTuesdayMeeting={(event) => setTuesdayMeetingDialog(event)}
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} 
              formatTime={formatTime}
              isAdmin={isAdmin}
            />
          </TabsContent>
          
          <TabsContent value="my-events">
            <EventsList 
              events={sortedEvents} 
              getUser={getUser} 
              currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onManageTuesdayMeeting={(event) => setTuesdayMeetingDialog(event)}
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} 
              formatTime={formatTime}
              isAdmin={isAdmin}
            />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="pending">
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="flex items-center text-amber-800 font-medium">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Pending Events
                </h3>
                <p className="text-amber-700 text-sm mt-1">
                  These events require your approval before they are visible to members.
                </p>
              </div>
              <PendingEventsList 
                events={sortedEvents} 
                getUser={getUser} 
                onApprove={handleApproveEvent} 
                onDisapprove={handleDisapproveEvent} 
                onView={(event) => setEventDetails(event)} 
                formatTime={formatTime}
              />
            </TabsContent>
          )}
          
          <TabsContent value="cancelled">
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="flex items-center text-gray-800 font-medium">
                <AlertCircle className="h-5 w-5 mr-2" />
                Cancelled Events
              </h3>
              <p className="text-gray-700 text-sm mt-1">
                These events have been cancelled and are not visible to members.
              </p>
            </div>
            <EventsList 
              events={sortedEvents} 
              getUser={getUser} 
              currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onManageTuesdayMeeting={(event) => setTuesdayMeetingDialog(event)}
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} 
              formatTime={formatTime}
              isAdmin={isAdmin}
              isCancelled 
            />
          </TabsContent>
        </Tabs>
      ) : (
        <EventCalendarView
          currentDate={currentDate}
          eventsInMonth={eventsInMonth}
          onPreviousMonth={previousMonth}
          onNextMonth={nextMonth}
          getEventsForDay={getEventsForDay}
          generateCalendarDays={generateCalendarDays}
          onEventClick={(event) => setEventDetails(event)}
          getUser={getUser}
          currentUser={currentUser}
          onManageTuesdayMeeting={(event) => setTuesdayMeetingDialog(event)}
          onCancel={handleCancelEvent}
          onDelete={handleDeleteEvent}
          formatTime={formatTime}
          isAdmin={isAdmin}
        />
      )}

      <Dialog open={!!eventDetails} onOpenChange={(open) => !open && setEventDetails(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{eventDetails?.name}</DialogTitle>
            <DialogDescription>
              {eventDetails && format(new Date(eventDetails.date), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {eventDetails && formatTime(eventDetails.startTime)} - {eventDetails && formatTime(eventDetails.endTime)}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{eventDetails?.location}</span>
            </div>
            {eventDetails?.isPresentationMeeting && eventDetails?.presenter && (
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
            {eventDetails?.description && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-gray-700">{eventDetails.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {eventDetails?.isCancelled && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                  Cancelled
                </Badge>
              )}
              {eventDetails && !eventDetails.isApproved && !eventDetails.isCancelled && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Pending Approval
                </Badge>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <div>
              {isAdmin && eventDetails && !eventDetails.isCancelled && (
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
                            handleCancelEvent(eventDetails);
                          } else {
                            handleDeleteEvent(eventDetails.id);
                          }
                          setEventDetails(null);
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

      <Dialog open={!!tuesdayMeetingDialog} onOpenChange={(open) => !open && setTuesdayMeetingDialog(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Manage Tuesday Meeting</DialogTitle>
            <DialogDescription>
              {tuesdayMeetingDialog && format(new Date(tuesdayMeetingDialog.date), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPresentationMeeting"
                checked={tuesdayMeetingDialog?.isPresentationMeeting || false}
                onChange={(e) => {
                  if (tuesdayMeetingDialog) {
                    setTuesdayMeetingDialog({
                      ...tuesdayMeetingDialog,
                      isPresentationMeeting: e.target.checked,
                      presenter: e.target.checked ? tuesdayMeetingDialog.presenter : undefined
                    });
                  }
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPresentationMeeting">This is a presentation meeting</Label>
            </div>
            
            {tuesdayMeetingDialog?.isPresentationMeeting && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="presenter" className="text-right">
                  Presenter
                </Label>
                <Select
                  value={tuesdayMeetingDialog.presenter || ""}
                  onValueChange={(value) => setTuesdayMeetingDialog(prev => 
                    prev ? { ...prev, presenter: value } : null
                  )}
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
              onClick={() => tuesdayMeetingDialog && handleUpdateTuesdayMeeting(tuesdayMeetingDialog)} 
              className="bg-maroon hover:bg-maroon/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PresenterHistoryDialog
        open={presenterHistoryOpen}
        onOpenChange={setPresenterHistoryOpen}
        events={events}
        getUser={getUser}
      />
    </div>
  );
};

export default Events;
