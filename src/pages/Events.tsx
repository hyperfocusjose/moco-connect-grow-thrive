
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Event as EventType } from '@/types';
import { startOfDay } from 'date-fns';
import { toast } from 'sonner';
import EventsHeader from '@/components/events/EventsHeader';
import EventViewToggle from '@/components/events/EventViewToggle';
import EventTabs from '@/components/events/EventTabs';
import EventCalendarView from '@/components/events/EventCalendarView';
import EventDetailsDialog from '@/components/events/dialogs/EventDetailsDialog';
import TuesdayMeetingDialog from '@/components/events/dialogs/TuesdayMeetingDialog';
import PresenterHistoryDialog from '@/components/events/PresenterHistoryDialog';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createEventFilters, 
  getEventsByTab, 
  formatTime,
  getPresenterHistory
} from '@/components/events/EventDataProcessor';
import { useEventsInitialization } from '@/components/events/useEventsInitialization';

const Events = () => {
  const { events, createEvent, updateEvent, deleteEvent, getUser, users, fetchEvents } = useData();
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [eventDetails, setEventDetails] = useState<EventType | null>(null);
  const [presenterHistoryOpen, setPresenterHistoryOpen] = useState(false);
  const [tuesdayMeetingDialog, setTuesdayMeetingDialog] = useState<EventType | null>(null);
  const [tuesdayMeetingsInitialized, setTuesdayMeetingsInitialized] = useState(false);

  useEffect(() => {
    console.log('Events component mounted, fetching events...');
    // Add a slight delay to ensure any pending async operations complete
    const fetchData = async () => {
      await fetchEvents();
      console.log('Events fetched in Events component, count:', events.length);
    };
    
    fetchData();
  }, [fetchEvents]);

  // Debug the events
  useEffect(() => {
    console.log('Events component has', events.length, 'events');
    if (events.length > 0) {
      console.log('Sample event:', events[0]);
    }
  }, [events]);

  const isAdmin = currentUser?.isAdmin;

  const today = startOfDay(new Date());

  // Use our custom hook for initializing Tuesday meetings
  useEventsInitialization(
    isAdmin, 
    events, 
    createEvent, 
    currentUser, 
    tuesdayMeetingsInitialized, 
    setTuesdayMeetingsInitialized
  );

  // Filter events based on the selected tab
  const eventFilters = createEventFilters(events, currentUser, today);
  const filteredEvents = getEventsByTab(selectedTab, eventFilters);

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return selectedTab === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  // Events for calendar view
  const eventsInMonth = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && event.isApproved;
  });

  // Handler functions
  const handleUpdateTuesdayMeeting = (event: EventType) => {
    if (!tuesdayMeetingDialog) return;
    
    const updatedEvent = { 
      ...event,
      isPresentationMeeting: tuesdayMeetingDialog.isPresentationMeeting,
      presenter: tuesdayMeetingDialog.presenter
    };
    
    updateEvent(event.id, updatedEvent);
    setTuesdayMeetingDialog(null);
    
    toast.success("Meeting updated", {
      description: updatedEvent.isPresentationMeeting 
        ? "Presenter has been assigned to this meeting" 
        : "Meeting has been updated",
    });
  };

  const handleCancelEvent = (event: EventType) => {
    const updatedEvent = { ...event, isCancelled: true };
    updateEvent(event.id, updatedEvent);
    
    toast.warning("Event cancelled", {
      description: "The event has been cancelled successfully",
    });
  };

  const handleApproveEvent = (event: EventType) => {
    const updatedEvent = { ...event, isApproved: true };
    updateEvent(event.id, updatedEvent);
    
    toast.success("Event approved", {
      description: "The event has been approved successfully",
    });
  };

  const handleDisapproveEvent = (event: EventType) => {
    const updatedEvent = { ...event, isCancelled: true };
    updateEvent(event.id, updatedEvent);
    
    toast.error("Event disapproved", {
      description: "The event has been moved to cancelled events",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    
    toast.success("Event deleted", {
      description: "The event has been deleted permanently",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <EventsHeader 
          isAdmin={!!isAdmin} 
          onOpenPresenterHistory={() => setPresenterHistoryOpen(true)} 
        />
        <EventViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {viewMode === 'list' ? (
        <EventTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          sortedEvents={sortedEvents}
          getUser={getUser}
          currentUser={currentUser}
          onView={(event) => setEventDetails(event)}
          onManageTuesdayMeeting={(event) => setTuesdayMeetingDialog(event)}
          onCancel={handleCancelEvent}
          onDelete={handleDeleteEvent}
          formatTime={formatTime}
          isAdmin={isAdmin}
        />
      ) : (
        <EventCalendarView
          currentDate={currentDate}
          eventsInMonth={eventsInMonth}
          onPreviousMonth={() => setCurrentDate(prevDate => new Date(prevDate.setMonth(prevDate.getMonth() - 1)))}
          onNextMonth={() => setCurrentDate(prevDate => new Date(prevDate.setMonth(prevDate.getMonth() + 1)))}
          getEventsForDay={(day) => eventsInMonth.filter(event => 
            new Date(event.date).toDateString() === day.toDateString()
          )}
          generateCalendarDays={() => {
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            
            const days = [];
            for (let i = 0; i < firstDay; i++) {
              days.push(null);
            }
            
            for (let i = 1; i <= daysInMonth; i++) {
              days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
            }
            
            return days;
          }}
          onEventClick={(event) => setEventDetails(event)}
          getUser={getUser}
          currentUser={currentUser}
          onManageTuesdayMeeting={(event) => setTuesdayMeetingDialog(event)}
          onCancel={handleCancelEvent}
          onDelete={handleDeleteEvent}
          formatTime={formatTime}
          isAdmin={isAdmin}
        />
      )}

      {/* Dialogs */}
      <EventDetailsDialog 
        isOpen={!!eventDetails} 
        onOpenChange={(open) => !open && setEventDetails(null)}
        eventDetails={eventDetails}
        getUser={getUser}
        formatTime={formatTime}
        isAdmin={!!isAdmin}
        onCancel={handleCancelEvent}
        onDelete={handleDeleteEvent}
      />

      <TuesdayMeetingDialog
        isOpen={!!tuesdayMeetingDialog}
        onOpenChange={(open) => !open && setTuesdayMeetingDialog(null)}
        tuesdayMeetingDialog={tuesdayMeetingDialog}
        setTuesdayMeetingDialog={setTuesdayMeetingDialog}
        users={users}
        onUpdateMeeting={handleUpdateTuesdayMeeting}
      />

      <PresenterHistoryDialog
        open={presenterHistoryOpen}
        onOpenChange={setPresenterHistoryOpen}
        events={events}
        getUser={getUser}
      />
    </div>
  );
};

export default Events;
