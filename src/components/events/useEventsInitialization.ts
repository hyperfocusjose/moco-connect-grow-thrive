
import { useEffect } from 'react';
import { Event as EventType } from '@/types';
import { eachTuesdayOfInterval, formatDateForComparison } from '@/utils/dateUtils';
import { addYears, startOfDay } from 'date-fns';

export const useEventsInitialization = (
  isAdmin: boolean | undefined,
  events: EventType[],
  createEvent: (event: Partial<EventType>) => Promise<void>,
  currentUser: any,
  tuesdayMeetingsInitialized: boolean,
  setTuesdayMeetingsInitialized: (initialized: boolean) => void
) => {
  // Initialize Tuesday meetings if admin
  useEffect(() => {
    if (isAdmin && !tuesdayMeetingsInitialized && events.length > 0) {
      const today = startOfDay(new Date());
      const nextYear = addYears(today, 1);
      
      const futureTuesdays = eachTuesdayOfInterval({
        start: today,
        end: nextYear
      });
      
      const existingTuesdayMeetingDates = new Set(
        events
          .filter(event => event.name.includes('Tuesday Meeting'))
          .map(event => formatDateForComparison(new Date(event.date)))
      );
      
      const missingTuesdays = futureTuesdays.filter(
        tuesday => !existingTuesdayMeetingDates.has(formatDateForComparison(tuesday))
      );
      
      if (missingTuesdays.length > 0) {
        missingTuesdays.forEach(tuesday => {
          createEvent({
            name: 'Tuesday Meeting',
            date: tuesday,
            startTime: '08:00',
            endTime: '09:00',
            location: 'Keller Williams Office, 2201 Lake Woodlands Dr, Spring, TX 77380',
            description: 'Regular weekly meeting for members',
            createdBy: currentUser?.id || 'system',
            isApproved: true,
            isFeatured: false,
            isPresentationMeeting: false,
            createdAt: new Date()
          });
        });
      }
      
      setTuesdayMeetingsInitialized(true);
    }
  }, [isAdmin, events, createEvent, currentUser, tuesdayMeetingsInitialized, setTuesdayMeetingsInitialized]);
};
