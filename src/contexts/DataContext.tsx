
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Event, Visitor, Referral, OneToOne, TYFCB, Activity, Poll } from '@/types';

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

    setEvents(prev => [...prev, newEvent]);
    return Promise.resolve();
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    setEvents(prev =>
      prev.map(item => item.id === id ? { ...item, ...event } : item)
    );
    return Promise.resolve();
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(item => item.id !== id));
    return Promise.resolve();
  };

  const getUserMetrics = (userId: string) => {
    return {};
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

