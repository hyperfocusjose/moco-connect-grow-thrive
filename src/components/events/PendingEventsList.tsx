
import React from 'react';
import { Event, User } from '@/types';
import { Clock, MapPin, User as UserIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PendingEventsListProps {
  events: Event[];
  getUser: (id: string) => User | undefined;
  onApprove: (event: Event) => void;
  onDisapprove: (event: Event) => void;  // Updated to take an Event object
  onView: (event: Event) => void;
  formatTime: (time: string) => string;
}

const PendingEventsList = ({ events, getUser, onApprove, onDisapprove, onView, formatTime }: PendingEventsListProps) => {
  return (
    <div className="space-y-4">
      {events.length > 0 ? (
        events.map(event => (
          <Card key={event.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription>
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Clock className="mr-1 h-4 w-4" />
                <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <UserIcon className="mr-1 h-4 w-4" />
                <span>Created by: {
                  getUser(event.createdBy) 
                    ? `${getUser(event.createdBy).firstName} ${getUser(event.createdBy).lastName}`
                    : 'Unknown'
                }</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex space-x-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => onView(event)}
                >
                  View Details
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove(event)}
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex-1"
                  onClick={() => onDisapprove(event)}
                >
                  Reject
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No pending events found.
        </div>
      )}
    </div>
  );
};

export default PendingEventsList;
