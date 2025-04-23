import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Event, Visitor } from '@/types';

interface DefaultUsers {
  [key: string]: User;
}

interface DefaultEvents {
  [key: string]: Event;
}

const defaultUsers: DefaultUsers = {
  'user-1': {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    businessName: 'Doe Consulting',
    industry: 'Consulting',
    bio: 'Experienced consultant specializing in business strategy.',
    tags: ['strategy', 'management', 'leadership'],
    profilePicture: '/images/avatars/avatar-1.png',
    isAdmin: true,
    website: 'https://www.example.com',
    linkedin: 'john.doe',
    twitter: '@johndoe',
    instagram: 'johndoe',
  },
  'user-2': {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '987-654-3210',
    businessName: 'Smith Designs',
    industry: 'Design',
    bio: 'Creative designer with a passion for user-centered design.',
    tags: ['UI', 'UX', 'graphic design'],
    profilePicture: '/images/avatars/avatar-2.png',
    isAdmin: false,
    website: 'https://www.example.com',
    linkedin: 'janesmith',
    twitter: '@janesmith',
    instagram: 'janesmith',
  },
  'user-3': {
    id: 'user-3',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    phoneNumber: '555-123-4567',
    businessName: 'Johnson Marketing',
    industry: 'Marketing',
    bio: 'Marketing expert helping businesses grow their online presence.',
    tags: ['SEO', 'social media', 'content marketing'],
    profilePicture: '/images/avatars/avatar-3.png',
    isAdmin: false,
    website: 'https://www.example.com',
    linkedin: 'alicejohnson',
    twitter: '@alicejohnson',
    instagram: 'alicejohnson',
  },
};

const defaultEvents: DefaultEvents = {
  'event-1': {
    id: 'event-1',
    name: 'Networking Mixer',
    date: new Date('2024-08-15'),
    startTime: '18:00',
    endTime: '21:00',
    location: 'The Grand Ballroom',
    description: 'Join us for an evening of networking and fun!',
    createdBy: 'user-1',
    isApproved: true,
    isFeatured: true,
    isPresentationMeeting: false,
    createdAt: new Date(),
  },
  'event-2': {
    id: 'event-2',
    name: 'Marketing Workshop',
    date: new Date('2024-09-01'),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Conference Center A',
    description: 'Learn the latest marketing strategies from industry experts.',
    createdBy: 'user-2',
    isApproved: true,
    isFeatured: false,
    isPresentationMeeting: false,
    createdAt: new Date(),
  },
  'event-3': {
    id: 'event-3',
    name: 'Tuesday Meeting',
    date: new Date('2024-07-09'),
    startTime: '08:00',
    endTime: '09:00',
    location: 'Keller Williams Office',
    description: 'Regular weekly meeting for members',
    createdBy: 'user-1',
    isApproved: true,
    isFeatured: false,
    isPresentationMeeting: true,
    presenter: 'user-3',
    createdAt: new Date(),
  },
  'event-4': {
    id: 'event-4',
    name: 'Tuesday Meeting',
    date: new Date('2024-07-16'),
    startTime: '08:00',
    endTime: '09:00',
    location: 'Keller Williams Office',
    description: 'Regular weekly meeting for members',
    createdBy: 'user-1',
    isApproved: true,
    isFeatured: false,
    isPresentationMeeting: false,
    createdAt: new Date(),
  },
  'event-5': {
    id: 'event-5',
    name: 'Tuesday Meeting',
    date: new Date('2024-07-23'),
    startTime: '08:00',
    endTime: '09:00',
    location: 'Keller Williams Office',
    description: 'Regular weekly meeting for members',
    createdBy: 'user-1',
    isApproved: true,
    isFeatured: false,
    isPresentationMeeting: false,
    createdAt: new Date(),
  },
};

export interface DataContextType {
  users: User[];
  events: Event[];
  visitors: Visitor[];
  getUser: (userId: string) => User | undefined;
  createEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getUserMetrics: (userId: string) => any;
  addVisitor: (visitor: Partial<Visitor>) => Promise<void>;
  updateVisitor: (id: string, visitor: Partial<Visitor>) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  users: [],
  events: [],
  visitors: [],
  getUser: () => undefined,
  createEvent: async () => {},
  updateEvent: async () => {},
  deleteEvent: async () => {},
  getUserMetrics: () => ({}),
  addVisitor: async () => {},
  updateVisitor: async () => {},
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(Object.values(defaultUsers));
  const [events, setEvents] = useState<Event[]>(Object.values(defaultEvents));
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const getUser = (userId: string) => {
    return users.find(user => user.id === userId);
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
    // In a real application, this data would likely come from a database.
    return {
      referrals: 15,
      visitors: 8,
      oneToOnes: 22,
      tyfcb: {
        count: 5,
        amount: 750,
      },
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

  return (
    <DataContext.Provider value={{
      users,
      events,
      getUser,
      createEvent,
      updateEvent,
      deleteEvent,
      getUserMetrics,
      visitors,
      addVisitor,
      updateVisitor,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
