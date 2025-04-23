import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Event, Visitor, Referral, OneToOne, TYFCB, Activity, Poll } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Initialize with empty data arrays, removing all demo data.
const defaultUsers: User[] = [];
const defaultEvents: Event[] = [];

export interface DataContextType {
  users: User[];
  events: Event[];
  visitors: Visitor[];
  activities: Activity[];
  referrals: Referral[];
  oneToOnes: OneToOne[];
  tyfcbs: TYFCB[];
  polls: Poll[];
  stats: Record<string, any>;
  getUser: (userId: string) => User | undefined;
  createEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getUserMetrics: (userId: string) => any;
  addVisitor: (visitor: Partial<Visitor>) => Promise<void>;
  updateVisitor: (id: string, visitor: Partial<Visitor>) => Promise<void>;
  addReferral: (referral: Partial<Referral>) => Promise<void>;
  addOneToOne: (oneToOne: Partial<OneToOne>) => Promise<void>;
  addTYFCB: (tyfcb: Partial<TYFCB>) => Promise<void>;
  createPoll: (poll: Partial<Poll>) => Promise<void>;
  updatePoll: (id: string, poll: Partial<Poll>) => Promise<void>;
  deletePoll: (id: string) => Promise<void>;
  votePoll: (pollId: string, optionId: string) => Promise<void>;
  hasVoted: (pollId: string, userId: string) => boolean;
  getTopPerformers: () => any;
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  users: [],
  events: [],
  visitors: [],
  activities: [],
  referrals: [],
  oneToOnes: [],
  tyfcbs: [],
  polls: [],
  stats: {},
  getUser: () => undefined,
  createEvent: async () => {},
  updateEvent: async () => {},
  deleteEvent: async () => {},
  getUserMetrics: () => ({}),
  addVisitor: async () => {},
  updateVisitor: async () => {},
  addReferral: async () => {},
  addOneToOne: async () => {},
  addTYFCB: async () => {},
  createPoll: async () => {},
  updatePoll: async () => {},
  deletePoll: async () => {},
  votePoll: async () => {},
  hasVoted: () => false,
  getTopPerformers: () => ({}),
  addUser: async () => {},
  updateUser: async () => {},
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All state initializations empty
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [oneToOnes, setOneToOnes] = useState<OneToOne[]>([]);
  const [tyfcbs, setTYFCBs] = useState<TYFCB[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);

  // Fetch events from Supabase on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
        
        if (error) {
          console.error('Error fetching events:', error);
          return;
        }
        
        // Transform the data to match the Event type
        const transformedEvents: Event[] = data.map(event => ({
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
          presenter: event.presenter || undefined,
          createdAt: new Date(event.created_at),
          isCancelled: event.is_cancelled || false,
        }));
        
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error in fetchEvents:', error);
      }
    };
    
    fetchEvents();
  }, []);

  // Remove demo stats; default to empty object, provide dummy implementations.
  const stats = {};

  const getUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    return Promise.resolve();
  };

  const updateUser = async (id: string, updatedUserData: Partial<User>) => {
    setUsers(prev => 
      prev.map(user => user.id === id ? { ...user, ...updatedUserData } : user)
    );
    return Promise.resolve();
  };

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

      // Insert into Supabase
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

  const getUserMetrics = (userId: string) => {
    // Ensure we always return a properly structured object with all expected properties
    return {
      referrals: 0,
      visitors: 0,
      oneToOnes: 0,
      tyfcb: {
        amount: 0,
        count: 0
      }
    };
  };

  const addVisitor = async (visitor: Partial<Visitor>) => {
    const newVisitor: Visitor = {
      id: uuidv4(),
      visitorName: visitor.visitorName || '',
      visitorBusiness: visitor.visitorBusiness || '',
      visitDate: visitor.visitDate || new Date(),
      hostMemberId: visitor.hostMemberId,
      isSelfEntered: visitor.isSelfEntered || false,
      phoneNumber: visitor.phoneNumber,
      email: visitor.email,
      industry: visitor.industry,
      createdAt: new Date(),
    };

    setVisitors(prev => [...prev, newVisitor]);
    return Promise.resolve();
  };

  const updateVisitor = async (id: string, visitor: Partial<Visitor>) => {
    setVisitors(prev => 
      prev.map(item => item.id === id ? { ...item, ...visitor } : item)
    );
    return Promise.resolve();
  };

  const addReferral = async (referral: Partial<Referral>) => {
    return Promise.resolve();
  };

  const addOneToOne = async (oneToOne: Partial<OneToOne>) => {
    return Promise.resolve();
  };

  const addTYFCB = async (tyfcb: Partial<TYFCB>) => {
    return Promise.resolve();
  };

  const createPoll = async (poll: Partial<Poll>) => {
    return Promise.resolve();
  };

  const updatePoll = async (id: string, poll: Partial<Poll>) => {
    return Promise.resolve();
  };

  const deletePoll = async (id: string) => {
    return Promise.resolve();
  };

  const votePoll = async (pollId: string, optionId: string) => {
    return Promise.resolve();
  };

  const hasVoted = (pollId: string, userId: string) => {
    return false;
  };

  const getTopPerformers = () => {
    return {};
  };

  return (
    <DataContext.Provider value={{
      users,
      events,
      visitors,
      activities,
      referrals,
      oneToOnes,
      tyfcbs,
      polls,
      stats,
      getUser,
      createEvent,
      updateEvent,
      deleteEvent,
      getUserMetrics,
      addVisitor,
      updateVisitor,
      addReferral,
      addOneToOne,
      addTYFCB,
      createPoll,
      updatePoll,
      deletePoll,
      votePoll,
      hasVoted,
      getTopPerformers,
      addUser,
      updateUser,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
