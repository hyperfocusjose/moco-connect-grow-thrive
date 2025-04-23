
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Event } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isAfter, isBefore, startOfToday } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const UpcomingEvents: React.FC = () => {
  const { events, getUser } = useData();
  const navigate = useNavigate();
  
  // Get approved, featured events that haven't happened yet
  const today = startOfToday();
  const upcomingEvents = events
    .filter(event => 
      event.isApproved && 
      event.isFeatured && 
      isAfter(new Date(event.date), today)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Get the next Tuesday meeting
  const nextTuesdayMeeting = events
    .filter(event => 
      event.isApproved && 
      event.name.toLowerCase().includes('tuesday meeting') &&
      isAfter(new Date(event.date), today)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    [0];

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d');
  };

  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-maroon" />
          Upcoming Events
        </CardTitle>
        <CardDescription>Latest events scheduled for the group</CardDescription>
      </CardHeader>
      <CardContent>
        {nextTuesdayMeeting && (
          <div className="mb-6 bg-muted/50 p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{nextTuesdayMeeting.name}</h3>
                <p className="text-sm text-muted-foreground">{formatDate(new Date(nextTuesdayMeeting.date))}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(nextTuesdayMeeting.startTime, nextTuesdayMeeting.endTime)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{nextTuesdayMeeting.location}</p>
              </div>
              {nextTuesdayMeeting.isPresentationMeeting && nextTuesdayMeeting.presenter && (
                <div className="bg-maroon/10 p-2 rounded text-xs">
                  <p className="font-medium text-maroon">Presenter:</p>
                  <p>{getUser(nextTuesdayMeeting.presenter)?.firstName} {getUser(nextTuesdayMeeting.presenter)?.lastName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents
              .filter(event => 
                !event.name.toLowerCase().includes('tuesday meeting') || 
                (event.id !== nextTuesdayMeeting?.id)
              )
              .map((event) => (
                <div key={event.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(new Date(event.date))}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(event.startTime, event.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                    </div>
                    {event.isPresentationMeeting && (
                      <Badge variant="outline" className="text-maroon border-maroon">
                        Presentation
                      </Badge>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming events scheduled.</p>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/events')}
        >
          View All Events
        </Button>
      </CardContent>
    </Card>
  );
};
