import { useState, useCallback, useEffect, useRef } from 'react';
import { Event } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchEvents = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadError(null);
    console.log('fetchEvents: Starting to fetch events');

    try {
      const { data, error } = await supabase.from('events').select('*');
      if (!isMountedRef.current) return;

      if (error) {
        console.error('Error fetching events:', error);
        setLoadError(error.message);
        toast.error('Failed to load events', { id: 'events-load-error' });
        return;
      }
      
      console.log('fetchEvents: Fetched events:', data?.length || 0);

      const formattedEvents: Event[] = (data || []).map(event => ({
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
      }));

      setEvents(formattedEvents);
      setLoadError(null);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load events', { id: 'events-load-error' });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      console.log('fetchEvents: Completed');
    }
  }, [isLoading]);

  useEffect(() => {
    console.log('useEvents: Initial mount, fetching events');
    fetchEvents();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEvents]);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  const resetFetchState = useCallback(() => {
    setLoadError(null);
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

      if (error) throw new Error(error.message);

      setEvents(prev => [...prev, newEvent]);
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
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

      if (error) throw new Error(error.message);

      setEvents(prev => prev.map(item => item.id === id ? { ...item, ...event } : item));
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw new Error(error.message);

      setEvents(prev => prev.filter(item => item.id !== id));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
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
    cleanup,
  };
};
