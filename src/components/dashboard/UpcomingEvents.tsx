
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTime } from '@/components/events/EventDataProcessor';

export const UpcomingEvents = () => {
  const { events, isLoading, loadError } = useData();
  
  // Create dates in UTC to match how they're stored in the database
  const today = useMemo(() => {
    const now = new Date();
    // We don't want to transform to UTC here as it leads to date confusion
    // Just set the time to beginning of day
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }, []);
  
  const in14Days = useMemo(() => {
    const future = new Date(today);
    future.setDate(today.getDate() + 14);
    return future;
  }, [today]);
  
  console.log('UpcomingEvents: Events total count:', events.length);
  console.log('UpcomingEvents: Today date:', today.toISOString());
  console.log('UpcomingEvents: 14 days from now:', in14Days.toISOString());
  
  // Debug all events dates
  console.log('UpcomingEvents: All events:', events.map(e => ({
    id: e.id,
    name: e.name,
    rawDate: e.date,
    date: new Date(e.date),
    dateISO: new Date(e.date).toISOString(),
    isCancelled: e.isCancelled,
    isApproved: e.isApproved,
    eventYear: new Date(e.date).getFullYear(),
    eventMonth: new Date(e.date).getMonth(),
    eventDay: new Date(e.date).getDate()
  })));
  
  // Get upcoming approved events in the next 14 days
  const upcomingEvents = useMemo(() => {
    // First normalize all the dates to ensure consistent comparison
    const filtered = events.filter(event => {
      // Handle case where event.date might be a string or Date
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      
      // Make sure date is valid
      if (!(eventDate instanceof Date) || isNaN(eventDate.getTime())) {
        console.log(`UpcomingEvents: Invalid date for event ${event.id}:`, event.date);
        return false;
      }
      
      // Check approval and cancelled status
      if (!event.isApproved || event.isCancelled) {
        return false;
      }
      
      // Compare just the date parts, not times
      const eventDay = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );
      
      // Logging each event's date comparison results
      const isAfterToday = !isBefore(eventDay, today) || isToday(eventDay);
      const isBeforeOrEqual14Days = !isAfter(eventDay, in14Days);
      
      console.log(`UpcomingEvents: Event "${event.name}" (${eventDay.toISOString()}):`, {
        isAfterToday,
        isBeforeOrEqual14Days,
        approved: event.isApproved,
        cancelled: event.isCancelled,
        will_include: (isAfterToday && isBeforeOrEqual14Days && event.isApproved && !event.isCancelled)
      });
      
      return isAfterToday && isBeforeOrEqual14Days;
    });
    
    const sorted = filtered.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log('UpcomingEvents: Filtered upcoming events:', sorted.length, sorted);
    return sorted;
  }, [events, today, in14Days]);

  // Get today's events
  const todayEvents = useMemo(() => {
    const filtered = events.filter(event => {
      // Handle case where event.date might be a string
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      
      // Check if event is valid
      if (!(eventDate instanceof Date) || isNaN(eventDate.getTime())) {
        return false;
      }
      
      // Compare just the date parts, not times
      const isEventToday = isToday(eventDate);
      
      return (
        event.isApproved && 
        !event.isCancelled && 
        isEventToday
      );
    });
    
    console.log('UpcomingEvents: Today\'s events:', filtered.length, filtered);
    return filtered;
  }, [events]);

  const hasEvents = upcomingEvents.length > 0 || todayEvents.length > 0;

  // Use the shared format time function
  const formatEventTime = (time) => formatTime(time);

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
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-maroon"></div>
          </div>
        ) : loadError ? (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Failed to load events</p>
                <p className="text-xs text-red-700">Please try again later</p>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                        {formatEventTime(event.startTime)} • {event.location}
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
                          {formatEventTime(event.startTime)} • {event.location}
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
          </>
        )}
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
