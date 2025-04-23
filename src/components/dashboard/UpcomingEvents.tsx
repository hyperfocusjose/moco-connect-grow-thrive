
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isAfter, startOfToday } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const UpcomingEvents: React.FC = () => {
  const { events, getUser } = useData();
  const navigate = useNavigate();

  // Get today's date
  const today = startOfToday();

  // Get upcoming, uncancelled, approved Tuesday meetings (case-insensitive)
  const upcomingTuesdayMeetings = events
    .filter(
      event =>
        event.isApproved &&
        !event.isCancelled &&
        event.name.toLowerCase().includes('tuesday meeting') &&
        isAfter(new Date(event.date), today)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  // Format date/time helpers
  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d');
  };

  const formatTime = (startTime: string, endTime: string) => {
    // Convert 24hr to 12hr format
    const format12Hour = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    
    return `${format12Hour(startTime)} - ${format12Hour(endTime)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-maroon" />
          Upcoming Events
        </CardTitle>
        <CardDescription>Next Tuesday meetings scheduled for the group</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTuesdayMeetings.length > 0 ? (
            upcomingTuesdayMeetings.map(event => (
              <div key={event.id} className="mb-6 bg-muted/50 p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(event.date))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(event.startTime, event.endTime)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                  </div>
                  {event.isPresentationMeeting && event.presenter && (
                    <div className="bg-maroon/10 p-2 rounded text-xs">
                      <p className="font-medium text-maroon">Presenter:</p>
                      <p>
                        {getUser(event.presenter)?.firstName}{' '}
                        {getUser(event.presenter)?.lastName}
                      </p>
                    </div>
                  )}
                </div>
                {!event.isPresentationMeeting && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    No presentation scheduled
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming Tuesday meetings scheduled.</p>
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
