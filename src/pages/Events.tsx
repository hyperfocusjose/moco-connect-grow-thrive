import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Event as EventType } from '@/types';
import { Calendar as CalendarIcon, MapPin, Clock, User, ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  format, 
  parse, 
  isSameMonth, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  addYears,
  isTuesday,
  startOfDay
} from 'date-fns';
import { eachTuesdayOfInterval, isAfter } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Events = () => {
  const { events, createEvent, updateEvent, deleteEvent, getUser, users } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [eventDetails, setEventDetails] = useState<EventType | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: new Date(),
    startTime: '19:00',
    endTime: '21:00',
    location: '',
    description: '',
    isPresentationMeeting: false,
    presenter: '',
  });
  
  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    if (isAdmin) {
      const today = startOfDay(new Date());
      const nextYear = addYears(today, 1);
      
      const futureTuesdays = eachTuesdayOfInterval({
        start: today,
        end: nextYear
      });
      
      futureTuesdays.forEach(tuesday => {
        const tuesdayExists = events.some(event => 
          isSameDay(new Date(event.date), tuesday) && 
          event.name.includes('Tuesday Meeting')
        );
        
        if (!tuesdayExists) {
          createEvent({
            id: `tuesday-meeting-${format(tuesday, 'yyyy-MM-dd')}`,
            name: 'Tuesday Meeting',
            date: tuesday,
            startTime: '19:00',
            endTime: '21:00',
            location: '123 Main St, Rockville, MD',
            description: 'Regular weekly meeting for members',
            createdBy: currentUser?.id || 'system',
            isApproved: true,
            isFeatured: true,
            isPresentationMeeting: false,
            createdAt: new Date()
          });
        }
      });
    }
  }, [currentUser, events, createEvent]);

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedTab === 'upcoming') {
      return eventDate >= today && event.isApproved;
    } else if (selectedTab === 'past') {
      return eventDate < today && event.isApproved;
    } else if (selectedTab === 'featured') {
      return event.isFeatured && event.isApproved;
    } else if (selectedTab === 'my-events' && currentUser) {
      return event.createdBy === currentUser.id || event.presenter === currentUser.id;
    } else if (selectedTab === 'pending' && isAdmin) {
      return !event.isApproved && !event.isCancelled;
    } else if (selectedTab === 'cancelled') {
      return event.isCancelled === true;
    }
    return false;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return selectedTab === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

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
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
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
      isPresentationMeeting: newEvent.isPresentationMeeting,
      presenter: newEvent.isPresentationMeeting ? newEvent.presenter : undefined,
      createdAt: new Date()
    };

    createEvent(event);
    
    setNewEvent({
      name: '',
      date: new Date(),
      startTime: '19:00',
      endTime: '21:00',
      location: '',
      description: '',
      isPresentationMeeting: false,
      presenter: '',
    });

    toast({
      title: isAdmin ? "Event created" : "Event submitted for approval",
      description: isAdmin 
        ? "The event has been created successfully" 
        : "Your event has been submitted and is pending approval",
    });
  };

  const handleCancelEvent = (event: EventType) => {
    const updatedEvent = { ...event, isCancelled: true };
    updateEvent(event.id, updatedEvent);
    
    toast({
      title: "Event cancelled",
      description: "The event has been cancelled successfully",
    });
  };

  const handleApproveEvent = (event: EventType) => {
    const updatedEvent = { ...event, isApproved: true };
    updateEvent(event.id, updatedEvent);
    
    toast({
      title: "Event approved",
      description: "The event has been approved successfully",
    });
  };

  const handleDisapproveEvent = (event: EventType) => {
    const updatedEvent = { ...event, isCancelled: true };
    updateEvent(event.id, updatedEvent);
    
    toast({
      title: "Event disapproved",
      description: "The event has been moved to cancelled events",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    
    toast({
      title: "Event deleted",
      description: "The event has been deleted permanently",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Browse and manage events for MocoPNG</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
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
                          className="rounded-md border"
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isPresentationMeeting" className="text-right">
                    Presentation?
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <input
                      type="checkbox"
                      id="isPresentationMeeting"
                      checked={newEvent.isPresentationMeeting}
                      onChange={(e) => setNewEvent({ ...newEvent, isPresentationMeeting: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isPresentationMeeting">This is a presentation meeting</Label>
                  </div>
                </div>
                {newEvent.isPresentationMeeting && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="presenter" className="text-right">
                      Presenter
                    </Label>
                    <select
                      id="presenter"
                      value={newEvent.presenter}
                      onChange={(e) => setNewEvent({ ...newEvent, presenter: e.target.value })}
                      className="col-span-3 w-full rounded-md border border-input px-3 py-2"
                    >
                      <option value="">Select a presenter</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
            <TabsTrigger value="featured">Featured</TabsTrigger>
            {currentUser && <TabsTrigger value="my-events">My Events</TabsTrigger>}
            {isAdmin && <TabsTrigger value="pending">Pending Approval</TabsTrigger>}
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} />
          </TabsContent>
          
          <TabsContent value="past">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} />
          </TabsContent>
          
          <TabsContent value="featured">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} />
          </TabsContent>
          
          <TabsContent value="my-events">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} />
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
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} 
              isCancelled 
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="font-medium text-sm py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {eachDayOfInterval({
              start: startOfMonth(currentDate),
              end: endOfMonth(currentDate)
            }).map((day, dayIdx) => {
              const eventsOnDay = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isTuesdayDay = isTuesday(day);
              
              return (
                <div 
                  key={dayIdx} 
                  className={`min-h-24 border rounded-md p-1 ${
                    isToday ? 'bg-gray-100' : ''
                  } ${
                    isTuesdayDay ? 'bg-maroon/5 border-maroon/20' : ''
                  }`}
                >
                  <div className="text-right text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {eventsOnDay.filter(e => !e.isCancelled).slice(0, 2).map((event) => (
                      <div 
                        key={event.id} 
                        className={`text-xs p-1 rounded ${
                          event.name.includes('Tuesday Meeting') 
                            ? 'bg-maroon/10 text-maroon' 
                            : 'bg-blue-100 text-blue-800'
                        } truncate cursor-pointer hover:opacity-80`}
                        title={event.name}
                        onClick={() => setEventDetails(event)}
                      >
                        {event.name}
                      </div>
                    ))}
                    {eventsOnDay.filter(e => !e.isCancelled).length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{eventsOnDay.filter(e => !e.isCancelled).length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Events this month</h3>
            <EventsList 
              events={eventsInMonth.filter(e => !e.isCancelled)} 
              getUser={getUser} 
              currentUser={currentUser} 
              onView={(event) => setEventDetails(event)} 
              onCancel={handleCancelEvent} 
              onDelete={handleDeleteEvent} 
            />
          </div>
        </div>
      )}

      <Dialog open={!!eventDetails} onOpenChange={(open) => !open && setEventDetails(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{eventDetails?.name}</DialogTitle>
            <DialogDescription>
              {format(eventDetails ? new Date(eventDetails.date) : new Date(), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{eventDetails?.startTime} - {eventDetails?.endTime}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{eventDetails?.location}</span>
            </div>
            {eventDetails?.isPresentationMeeting && eventDetails?.presenter && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
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
              {eventDetails?.isFeatured && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  Featured
                </Badge>
              )}
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
    </div>
  );
};

interface EventsListProps {
  events: EventType[];
  getUser: (userId: string) => any;
  currentUser: any;
  onView: (event: EventType) => void;
  onCancel: (event: EventType) => void;
  onDelete: (eventId: string) => void;
  isCancelled?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({ events, getUser, currentUser, onView, onCancel, onDelete, isCancelled }) => {
  const isAdmin = currentUser?.isAdmin;
  
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No events found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          getUser={getUser} 
          currentUser={currentUser} 
          onView={onView}
          onCancel={onCancel}
          onDelete={onDelete}
          isCancelled={isCancelled}
        />
      ))}
    </div>
  );
};

interface EventCardProps {
  event: EventType;
  getUser: (userId: string) => any;
  currentUser: any;
  onView: (event: EventType) => void;
  onCancel: (event: EventType) => void;
  onDelete: (eventId: string) => void;
  isCancelled?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, getUser, currentUser, onView, onCancel, onDelete, isCancelled }) => {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const presenter = event.presenter ? getUser(event.presenter) : null;
  const isAdmin = currentUser?.isAdmin;
  const isTuesdayMeeting = event.name.includes('Tuesday Meeting');

  return (
    <Card className={`overflow-hidden ${event.isCancelled ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{event.name}</CardTitle>
          <div className="flex space-x-1">
            {event.isFeatured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                Featured
              </Badge>
            )}
            {event.isCancelled && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                Cancelled
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {format(eventDate, 'EEEE, MMMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{event.location}</span>
          </div>
          {event.isPresentationMeeting && presenter && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>Presenter: {presenter.firstName} {presenter.lastName}</span>
            </div>
          )}
          {event.description && <p className="pt-2">{event.description}</p>}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant={isPast || event.isCancelled ? "outline" : "default"} 
          className={isPast || event.isCancelled ? "" : "bg-maroon hover:bg-maroon/90"} 
          size="sm"
          onClick={() => onView(event)}
        >
          {isPast ? "View Details" : event.isCancelled ? "View Details" : "RSVP"}
        </Button>
        
        {isAdmin && !event.isCancelled && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
              >
                {isTuesdayMeeting ? "Cancel" : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isTuesdayMeeting 
                    ? "This will cancel the Tuesday meeting. It won't be shown to members."
                    : "This will permanently delete the event and cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    if (isTuesdayMeeting) {
                      onCancel(event);
                    } else {
                      onDelete(event.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isTuesdayMeeting ? "Cancel Meeting" : "Delete Event"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};

interface PendingEventsListProps {
  events: EventType[];
  getUser: (userId: string) => any;
  onApprove: (event: EventType) => void;
  onDisapprove: (event: EventType) => void;
  onView: (event: EventType) => void;
}

const PendingEventsList: React.FC<PendingEventsListProps> = ({ events, getUser, onApprove, onDisapprove, onView }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pending events found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden border-amber-200">
          <CardHeader className="pb-2 bg-amber-50">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                Pending
              </Badge>
            </div>
            <CardDescription>
              {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
            <CardDescription className="text-xs mt-1">
              Submitted by: {getUser(event.createdBy)?.firstName} {getUser(event.createdBy)?.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{event.location}</span>
              </div>
              {event.isPresentationMeeting && event.presenter && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    Presenter: {
                      getUser(event.presenter) 
                        ? `${getUser(event.presenter).firstName} ${getUser(event.presenter).lastName}`
                        : 'Unknown'
                    }
                  </span>
                </div>
              )}
              {event.description && <p className="pt-2">{event.description}</p>}
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onView(event)}
            >
              View Details
            </Button>
            
            <div className="space-x-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDisapprove(event)}
              >
                Disapprove
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(event)}
              >
                Approve
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Events;
