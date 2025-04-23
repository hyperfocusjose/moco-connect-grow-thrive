
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { format, isSameDay, startOfToday, addDays, isAfter, isBefore } from 'date-fns';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export const UpcomingEvents = () => {
  const { events } = useData();
  const today = useMemo(() => startOfToday(), []);
  const in14Days = useMemo(() => addDays(today, 14), [today]);
  
  // Get upcoming approved events in the next 14 days
  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => 
        event.isApproved && 
        !event.isCancelled && 
        isAfter(new Date(event.date), today) && 
        isBefore(new Date(event.date), in14Days)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, today, in14Days]);

  // Get today's events
  const todayEvents = useMemo(() => {
    return events.filter(event => 
      event.isApproved && 
      !event.isCancelled && 
      isSameDay(new Date(event.date), today)
    );
  }, [events, today]);

  const hasEvents = upcomingEvents.length > 0 || todayEvents.length > 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 14 days</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/events">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {todayEvents.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Today</h3>
            <div className="space-y-3">
              {todayEvents.map(event => (
                <div key={event.id} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-blue-800">{event.name}</h4>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Today
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(new Date(event.date), "h:mm a")} • {event.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {upcomingEvents.length > 0 ? (
          <ScrollArea className="h-[260px] pr-4">
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex gap-3">
                  <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-white rounded border border-gray-200">
                    <span className="text-xs font-medium text-gray-500">
                      {format(new Date(event.date), "MMM")}
                    </span>
                    <span className="text-lg font-bold">
                      {format(new Date(event.date), "d")}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.date), "h:mm a")} • {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : todayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Calendar className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">No upcoming events in the next 14 days</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/events">Add an Event</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
      
      {hasEvents && (
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/events">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
