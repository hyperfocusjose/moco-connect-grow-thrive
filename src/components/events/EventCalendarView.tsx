
import React from 'react';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, isTuesday } from 'date-fns';
import EventsList from './EventsList';

interface EventCalendarViewProps {
  currentDate: Date;
  eventsInMonth: Event[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  getEventsForDay: (day: Date) => Event[];
  generateCalendarDays: () => (Date | null)[];
  onEventClick: (event: Event) => void;
  getUser: (id: string) => any;
  currentUser: any;
  onManageTuesdayMeeting: (event: Event) => void;
  onCancel: (event: Event) => void;
  onDelete: (id: string) => void;
  formatTime: (time: string) => string;
  isAdmin?: boolean;
}

const EventCalendarView = ({
  currentDate,
  eventsInMonth,
  onPreviousMonth,
  onNextMonth,
  getEventsForDay,
  generateCalendarDays,
  onEventClick,
  getUser,
  currentUser,
  onManageTuesdayMeeting,
  onCancel,
  onDelete,
  formatTime,
  isAdmin,
}: EventCalendarViewProps) => {
  // Create a wrapper function to adapt the onDelete function to match what EventsList expects
  const handleDelete = (event: Event) => {
    if (event.id) {
      onDelete(event.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <Button variant="outline" size="sm" onClick={onNextMonth}>
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
        {generateCalendarDays().map((day, dayIdx) => {
          if (day === null) {
            return <div key={`empty-${dayIdx}`} className="min-h-24 p-1"></div>;
          }
          
          const eventsOnDay = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isTuesdayDay = isTuesday(day);
          
          return (
            <div 
              key={dayIdx} 
              className={`min-h-24 border rounded-md p-1 ${
                isToday ? 'bg-gray-100' : ''
              } ${
                isTuesdayDay ? 'bg-maroon/5 border-maroon/20' : ''
              }`}
            >
              <div className="text-right text-sm font-medium mb-1">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {eventsOnDay.filter(e => !e.isCancelled).slice(0, 2).map((event) => (
                  <div 
                    key={event.id} 
                    className={`text-xs p-1 rounded ${
                      event.name.includes('Tuesday Meeting') 
                        ? 'bg-maroon/10 text-maroon' 
                        : 'bg-blue-100 text-blue-800'
                    } truncate cursor-pointer hover:opacity-80`}
                    title={event.name}
                    onClick={() => onEventClick(event)}
                  >
                    {event.name}
                  </div>
                ))}
                {eventsOnDay.filter(e => !e.isCancelled).length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{eventsOnDay.filter(e => !e.isCancelled).length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Events this month</h3>
        <EventsList 
          events={eventsInMonth.filter(e => !e.isCancelled)} 
          getUser={getUser} 
          currentUser={currentUser} 
          onView={onEventClick} 
          onManageTuesdayMeeting={onManageTuesdayMeeting}
          onCancel={onCancel} 
          onDelete={handleDelete} 
          formatTime={formatTime}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

export default EventCalendarView;
