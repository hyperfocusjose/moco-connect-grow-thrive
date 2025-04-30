
import { Event as EventType, User } from '@/types';
import { format, isPast, isSameDay } from 'date-fns';
import { formatDateForComparison } from '@/utils/dateUtils';

export const createEventFilters = (
  events: EventType[], 
  currentUser: User | null | undefined, 
  today: Date
) => {
  // Upcoming events with special handling for Tuesday meetings
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const isWeeklyMeeting = event.name.toLowerCase().includes('tuesday meeting');
    
    if (isWeeklyMeeting) {
      const uniqueTuesdayMeetingDates = new Map();
      
      events
        .filter(e => 
          e.name.toLowerCase().includes('tuesday meeting') && 
          !e.isCancelled && 
          e.isApproved &&
          new Date(e.date) >= today
        )
        .forEach(meeting => {
          const meetingDate = formatDateForComparison(new Date(meeting.date));
          if (!uniqueTuesdayMeetingDates.has(meetingDate) || meeting.isPresentationMeeting) {
            uniqueTuesdayMeetingDates.set(meetingDate, meeting);
          }
        });
      
      const upcomingTuesdayMeetings = Array.from(uniqueTuesdayMeetingDates.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 2);
      
      return upcomingTuesdayMeetings.some(meeting => meeting.id === event.id);
    }
    
    return eventDate >= today && event.isApproved && !event.isCancelled;
  });

  // Past events (excluding weekly meetings)
  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const isWeeklyMeeting = event.name.toLowerCase().includes('tuesday meeting');
    return eventDate < today && event.isApproved && !isWeeklyMeeting;
  });

  // My events
  const myEvents = currentUser ? events.filter(event => {
    const eventDate = new Date(event.date);
    return (event.createdBy === currentUser.id || event.presenter === currentUser.id) && 
           eventDate >= today;
  }) : [];

  // Pending events
  const pendingEvents = events.filter(event => !event.isApproved && !event.isCancelled);

  // Cancelled events
  const cancelledEvents = events.filter(event => event.isCancelled === true);

  return {
    upcomingEvents,
    pastEvents,
    myEvents,
    pendingEvents,
    cancelledEvents
  };
};

export const getEventsByTab = (
  selectedTab: string, 
  { upcomingEvents, pastEvents, myEvents, pendingEvents, cancelledEvents }: ReturnType<typeof createEventFilters>
) => {
  switch (selectedTab) {
    case 'upcoming':
      return upcomingEvents;
    case 'past':
      return pastEvents;
    case 'my-events':
      return myEvents;
    case 'pending':
      return pendingEvents;
    case 'cancelled':
      return cancelledEvents;
    default:
      return [];
  }
};

export const getPresenterHistory = (events: EventType[], getUser: (id: string) => User | undefined) => {
  return events
    .filter(event => 
      event.name.toLowerCase().includes('tuesday meeting') &&
      event.isPresentationMeeting && 
      event.presenter &&
      isPast(new Date(event.date))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(event => ({
      date: new Date(event.date),
      presenter: getUser(event.presenter || '')
    }));
};

// Format time function for consistent display
export const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return format(date, 'h:mm a'); // Format as 12-hour time with am/pm
  } catch (error) {
    console.error('Error formatting time:', time);
    return time; // Return original if parsing fails
  }
};
