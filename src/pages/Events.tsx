
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Event as EventType } from '@/types';
import { Calendar as CalendarIcon, MapPin, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format, parse, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const Events = () => {
  const { events, getUser } = useData();
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filter events based on the selected tab
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
    }
    return false;
  });

  // Sort events by date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return selectedTab === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  // Get events for the selected month (for calendar view)
  const eventsInMonth = events.filter(event => {
    const eventDate = new Date(event.date);
    return isSameMonth(eventDate, currentDate) && event.isApproved;
  });

  // Function to get events for a specific day
  const getEventsForDay = (day: Date) => {
    return eventsInMonth.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    });
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Browse and manage events for MocoPNG</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {currentUser && (
            <Button className="bg-maroon hover:bg-maroon/90">
              Create New Event
            </Button>
          )}
          
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
        <Tabs defaultValue="upcoming" onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            {currentUser && <TabsTrigger value="my-events">My Events</TabsTrigger>}
          </TabsList>

          <TabsContent value="upcoming">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} />
          </TabsContent>
          
          <TabsContent value="past">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} />
          </TabsContent>
          
          <TabsContent value="featured">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} />
          </TabsContent>
          
          <TabsContent value="my-events">
            <EventsList events={sortedEvents} getUser={getUser} currentUser={currentUser} />
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
              
              return (
                <div 
                  key={dayIdx} 
                  className={`min-h-24 border rounded-md p-1 ${
                    isToday ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="text-right text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {eventsOnDay.slice(0, 2).map((event) => (
                      <div 
                        key={event.id} 
                        className="text-xs p-1 rounded bg-maroon/10 text-maroon truncate"
                        title={event.name}
                      >
                        {event.name}
                      </div>
                    ))}
                    {eventsOnDay.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{eventsOnDay.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Events this month</h3>
            <EventsList events={eventsInMonth} getUser={getUser} currentUser={currentUser} />
          </div>
        </div>
      )}
    </div>
  );
};

interface EventsListProps {
  events: EventType[];
  getUser: (userId: string) => any;
  currentUser: any;
}

const EventsList: React.FC<EventsListProps> = ({ events, getUser, currentUser }) => {
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
        <EventCard key={event.id} event={event} getUser={getUser} currentUser={currentUser} />
      ))}
    </div>
  );
};

interface EventCardProps {
  event: EventType;
  getUser: (userId: string) => any;
  currentUser: any;
}

const EventCard: React.FC<EventCardProps> = ({ event, getUser, currentUser }) => {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const presenter = event.presenter ? getUser(event.presenter) : null;
  const isAdmin = currentUser?.isAdmin;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{event.name}</CardTitle>
          {event.isFeatured && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              Featured
            </Badge>
          )}
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
          <p className="pt-2">{event.description}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant={isPast ? "outline" : "default"} 
          className={isPast ? "" : "bg-maroon hover:bg-maroon/90"} 
          size="sm"
        >
          {isPast ? "View Details" : "RSVP"}
        </Button>
        
        {isAdmin && (
          <Button 
            variant="destructive" 
            size="sm"
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Events;
