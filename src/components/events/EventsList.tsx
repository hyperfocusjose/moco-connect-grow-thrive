
import React from 'react';
import { Event, User } from '@/types';
import EventCard from './EventCard';

interface EventsListProps {
  events: Event[];
  getUser: (id: string) => User | undefined;
  currentUser: any;
  onView: (event: Event) => void;
  onManageTuesdayMeeting?: (event: Event) => void;
  onCancel?: (event: Event) => void;
  onDelete?: (event: Event) => void;  // Updated to take an Event object, not just an ID
  formatTime: (time: string) => string;
  isAdmin?: boolean;
  isCancelled?: boolean;
}

const EventsList = ({
  events,
  getUser,
  onView,
  onManageTuesdayMeeting,
  onCancel,
  onDelete,
  formatTime,
  isAdmin,
  isCancelled = false
}: EventsListProps) => {
  return (
    <div className="space-y-4">
      {events.length > 0 ? (
        events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            getUser={getUser}
            onView={onView}
            onManageTuesdayMeeting={onManageTuesdayMeeting}
            onCancel={onCancel}
            onDelete={onDelete}
            formatTime={formatTime}
            isAdmin={isAdmin}
            isCancelled={isCancelled}
          />
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {isCancelled ? 'No cancelled events found.' : 'No events found.'}
        </div>
      )}
    </div>
  );
};

export default EventsList;
