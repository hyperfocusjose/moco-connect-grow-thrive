
import React from 'react';
import { Event, User } from '@/types';
import { Clock, MapPin, User as UserIcon } from 'lucide-react';
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

interface EventCardProps {
  event: Event;
  getUser: (id: string) => User | undefined;
  onView: (event: Event) => void;
  onManageTuesdayMeeting?: (event: Event) => void;
  onCancel?: (event: Event) => void;
  onDelete?: (id: string) => void;
  formatTime: (time: string) => string;
  isAdmin?: boolean;
  isCancelled?: boolean;
}

const EventCard = ({
  event,
  getUser,
  onView,
  onManageTuesdayMeeting,
  onCancel,
  onDelete,
  formatTime,
  isAdmin,
  isCancelled = false,
}: EventCardProps) => {
  return (
    <Card className={`overflow-hidden ${event.isCancelled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.name}</CardTitle>
            <CardDescription>
              {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </div>
          {event.name.toLowerCase().includes('tuesday meeting') && isAdmin && !isCancelled && onManageTuesdayMeeting && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onManageTuesdayMeeting(event)}
            >
              {event.isPresentationMeeting ? "Edit Presenter" : "Add Presenter"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock className="mr-1 h-4 w-4" />
          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          <span>{event.location}</span>
        </div>
        {event.isPresentationMeeting && event.presenter && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <UserIcon className="mr-1 h-4 w-4" />
            <span>Presenter: {
              getUser(event.presenter) 
                ? `${getUser(event.presenter).firstName} ${getUser(event.presenter).lastName}`
                : 'Unknown'
            }</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView(event)}
        >
          View Details
        </Button>
        {isAdmin && !isCancelled && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => event.name.toLowerCase().includes('tuesday meeting') ? onCancel?.(event) : onDelete?.(event.id)}
          >
            {event.name.toLowerCase().includes('tuesday meeting') ? 'Cancel Meeting' : 'Delete'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
