import { useState, useCallback, useRef } from 'react';
import { Event } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchEvents = useCallback(async (): Promise<void> => {
    // Prevent fetching if already loading
    if (isLoading) return;
    
    // Implement a simple cooldown to prevent rapid refetching
    const now = Date.now();
    const cooldownPeriod = 5000; // 5 seconds cooldown
    if (now - lastFetchTimeRef.current < cooldownPeriod) {
      console.log('Events fetch cooldown active, skipping request');
      return;
    }
    
    // Track fetch attempts and implement exponential backoff
    fetchAttemptRef.current += 1;
    const maxRetries = 3;
    if (fetchAttemptRef.current > maxRetries) {
      // Only show error toast on the first time we hit max retries
      if (fetchAttemptRef.current === maxRetries + 1) {
        setLoadError('Too many failed attempts to load events. Please try again later.');
        toast.error('Events could not be loaded', { 
          description: 'Check your network connection and try again later.',
          id: 'events-load-error' // This prevents duplicate toasts
        });
      }
      console.warn(`Events fetch exceeded ${maxRetries} attempts, stopping`);
      return;
    }

    // Only show loading state on first attempt 
    if (fetchAttemptRef.current === 1) {
      setIsLoading(true);
    }
    
    lastFetchTimeRef.current = now;

    try {
      console.log('Fetching events from Supabase...');
      const { data, error } = await supabase
        .from('events')
        .select('*');

      // Always check if the component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (error) {
        console.error('Error fetching events:', error);
        setLoadError(error.message);
        // Only show toast on first error, not on every retry
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load events', {
            id: 'events-load-error'
          });
        }
        return;
      }

      // Don't show any error toast if data is empty - this is normal
      console.log(`Retrieved ${data?.length || 0} events from Supabase`);
      
      // Always set events to data or an empty array if data is null
      const formattedEvents: Event[] = data ? data.map(event => ({
        id: event.id,
        name: event.name,
        date: new Date(event.date),
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        description: event.description || '',
        createdBy: event.created_by || '',
        isApproved: event.is_approved || false,
        isFeatured: event.is_featured || false,
        isPresentationMeeting: event.is_presentation_meeting || false,
        presenter: event.presenter,
        createdAt: new Date(event.created_at),
        isCancelled: event.is_cancelled || false,
      })) : [];

      console.log('Events transformed to client format:', formattedEvents.length);
      setEvents(formattedEvents);
      
      // Reset error state and fetch attempts on success
      setLoadError(null);
      fetchAttemptRef.current = 0;
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      
      // Only show toast on first error
      if (fetchAttemptRef.current === 1) {
        toast.error('Failed to load events', {
          id: 'events-load-error' 
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  // Reset mounted ref on cleanup
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  // Reset fetch attempt count and error state
  const resetFetchState = useCallback(() => {
    fetchAttemptRef.current = 0;
    setLoadError(null);
    lastFetchTimeRef.current = 0;
  }, []);

  const createEvent = async (event: Partial<Event>) => {
    try {
      const newEvent: Event = {
        id: uuidv4(),
        name: event.name || 'New Event',
        date: event.date || new Date(),
        startTime: event.startTime || '08:00',
        endTime: event.endTime || '09:00',
        location: event.location || 'Location TBD',
        description: event.description || '',
        createdBy: event.createdBy || '',
        isApproved: event.isApproved || false,
        isFeatured: event.isFeatured || false,
        isPresentationMeeting: event.isPresentationMeeting || false,
        presenter: event.presenter,
        createdAt: new Date(),
        isCancelled: false,
      };

      const { error } = await supabase.from('events').insert({
        id: newEvent.id,
        name: newEvent.name,
        date: newEvent.date.toISOString(),
        start_time: newEvent.startTime,
        end_time: newEvent.endTime,
        location: newEvent.location,
        description: newEvent.description,
        created_by: newEvent.createdBy,
        is_approved: newEvent.isApproved,
        is_featured: newEvent.isFeatured,
        is_presentation_meeting: newEvent.isPresentationMeeting,
        presenter: newEvent.presenter,
        created_at: newEvent.createdAt.toISOString(),
        is_cancelled: newEvent.isCancelled,
      });

      if (error) {
        console.error('Error creating event:', error);
        toast.error('Failed to create event');
        return;
      }

      setEvents(prev => [...prev, newEvent]);
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Error in createEvent:', error);
      toast.error('Failed to create event');
    }
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: event.name,
          date: event.date?.toISOString(),
          start_time: event.startTime,
          end_time: event.endTime,
          location: event.location,
          description: event.description,
          is_approved: event.isApproved,
          is_featured: event.isFeatured,
          is_presentation_meeting: event.isPresentationMeeting,
          presenter: event.presenter,
          is_cancelled: event.isCancelled,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating event:', error);
        toast.error('Failed to update event');
        return;
      }

      setEvents(prev =>
        prev.map(item => item.id === id ? { ...item, ...event } : item)
      );
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error in updateEvent:', error);
      toast.error('Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
        return;
      }

      setEvents(prev => prev.filter(item => item.id !== id));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      toast.error('Failed to delete event');
    }
  };

  return {
    events,
    isLoading,
    loadError,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    resetFetchState,
    cleanup
  };
};
