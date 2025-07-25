import { useState, useCallback, useEffect } from 'react';
import { Event } from '@/types';
import { demoEvents } from '@/data/demoData';
import { toast } from 'sonner';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setEvents(demoEvents);
      console.log(`Successfully loaded ${demoEvents.length} demo events`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLoadError(errorMsg);
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      name: eventData.name || '',
      date: eventData.date || new Date(),
      startTime: eventData.startTime || '18:00',
      endTime: eventData.endTime || '20:00',
      location: eventData.location || '',
      description: eventData.description || '',
      createdBy: eventData.createdBy || '1',
      isApproved: false,
      isFeatured: false,
      isPresentationMeeting: false,
      createdAt: new Date(),
      ...eventData,
    };
    
    setEvents(prev => [...prev, newEvent]);
    toast.success('Event created successfully');
    return newEvent;
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...eventData } : event
    ));
    toast.success('Event updated successfully');
    return Promise.resolve();
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    toast.success('Event deleted successfully');
    return Promise.resolve();
  };

  return {
    events,
    isLoading,
    loadError,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    resetFetchState: () => setLoadError(null)
  };
};