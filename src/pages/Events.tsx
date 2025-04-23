
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Event as EventType } from '@/types';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const Events = () => {
  const { events, getUser } = useData();
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Browse and manage events for MocoPNG</p>
        </div>
        
        {currentUser && (
          <Button className="mt-4 md:mt-0 bg-maroon hover:bg-maroon/90">
            Create New Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming" onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          {currentUser && <TabsTrigger value="my-events">My Events</TabsTrigger>}
        </TabsList>

        <TabsContent value="upcoming">
          <EventsList events={sortedEvents} getUser={getUser} />
        </TabsContent>
        
        <TabsContent value="past">
          <EventsList events={sortedEvents} getUser={getUser} />
        </TabsContent>
        
        <TabsContent value="featured">
          <EventsList events={sortedEvents} getUser={getUser} />
        </TabsContent>
        
        <TabsContent value="my-events">
          <EventsList events={sortedEvents} getUser={getUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface EventsListProps {
  events: EventType[];
  getUser: (userId: string) => any;
}

const EventsList: React.FC<EventsListProps> = ({ events, getUser }) => {
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
        <EventCard key={event.id} event={event} getUser={getUser} />
      ))}
    </div>
  );
};

interface EventCardProps {
  event: EventType;
  getUser: (userId: string) => any;
}

const EventCard: React.FC<EventCardProps> = ({ event, getUser }) => {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const presenter = event.presenter ? getUser(event.presenter) : null;

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
      <CardFooter className="pt-0">
        <Button 
          variant={isPast ? "outline" : "default"} 
          className={isPast ? "" : "bg-maroon hover:bg-maroon/90"} 
          size="sm"
        >
          {isPast ? "View Details" : "RSVP"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Events;
