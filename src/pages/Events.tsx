import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { Event } from '@/types';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useData } from '@/contexts/DataContext';

export default function Events() {
  const { events, fetchEvents } = useData();
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const weeklyMeetings = events.filter(event => !event.isPresentationMeeting);
  const presentationMeetings = events.filter(event => event.isPresentationMeeting);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild>
          <a href="/events/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Event
          </a>
        </Button>
      </div>

      <Tabs defaultValue="weekly" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Meetings</TabsTrigger>
          <TabsTrigger value="presentations">Presentation Meetings</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          {weeklyMeetings.length > 0 ? (
            weeklyMeetings.map((event) => (
              <Card key={event.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {format(event.date, 'MMMM dd, yyyy')} - {event.startTime} - {event.endTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{event.description}</p>
                  <p>Location: {event.location}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No weekly meetings scheduled.</p>
          )}
        </TabsContent>
        <TabsContent value="presentations">
          {presentationMeetings.length > 0 ? (
            presentationMeetings.map((event) => (
              <Card key={event.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {format(event.date, 'MMMM dd, yyyy')} - {event.startTime} - {event.endTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{event.description}</p>
                  <p>Location: {event.location}</p>
                  {event.presenter && <p>Presenter: {event.presenter}</p>}
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No presentation meetings scheduled.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
