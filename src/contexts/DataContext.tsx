
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Referral, Visitor, OneToOne, TYFCB, Event, Poll, Activity, User } from '@/types';
import { useAuth } from './AuthContext';

interface DataContextType {
  referrals: Referral[];
  visitors: Visitor[];
  oneToOnes: OneToOne[];
  tyfcbs: TYFCB[]; // Fixed: Changed from tyfcb to tyfcbs to match usage throughout the file
  events: Event[];
  polls: Poll[];
  activities: Activity[];
  users: User[];
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt'>) => Promise<void>;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'createdAt'>) => Promise<void>;
  addOneToOne: (oneToOne: Omit<OneToOne, 'id' | 'createdAt'>) => Promise<void>;
  addTYFCB: (tyfcb: Omit<TYFCB, 'id' | 'createdAt'>) => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  addPoll: (poll: Omit<Poll, 'id' | 'createdAt'>) => Promise<void>;
  voteInPoll: (pollId: string, optionId: string) => Promise<void>;
  approveEvent: (eventId: string, isApproved: boolean) => Promise<void>;
  featureEvent: (eventId: string, isFeatured: boolean) => Promise<void>;
  setPresenter: (eventId: string, presenterId: string | undefined) => Promise<void>;
  deleteItem: (type: 'referral' | 'visitor' | 'oneToOne' | 'tyfcb' | 'event' | 'poll', id: string) => Promise<void>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<void>;
  updatePoll: (pollId: string, pollData: Partial<Poll>) => Promise<void>;
  getUser: (userId: string) => User | undefined;
  getUserMetrics: (userId: string) => {
    referrals: number;
    visitors: number;
    oneToOnes: number;
    tyfcb: { count: number; amount: number };
  };
  getTopPerformers: () => {
    topReferrals: { user: User; count: number } | null;
    topVisitors: { user: User; count: number } | null;
    topOneToOnes: { user: User; count: number } | null;
    topTYFCB: { user: User; amount: number } | null;
  };
}

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@mocopng.com',
    firstName: 'Admin',
    lastName: 'User',
    businessName: 'MocoPNG Administration',
    phoneNumber: '555-123-4567',
    profilePicture: '/placeholder.svg',
    industry: 'Administration',
    bio: 'Group administrator',
    tags: ['admin', 'management'],
    isAdmin: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'plumber@example.com',
    firstName: 'John',
    lastName: 'Smith',
    businessName: 'Smith Plumbing',
    phoneNumber: '555-987-6543',
    profilePicture: '/placeholder.svg',
    industry: 'Plumbing',
    bio: 'Professional plumbing services with 15 years of experience',
    tags: ['plumbing', 'repairs', 'installation'],
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'realtor@example.com',
    firstName: 'Elizabeth',
    lastName: 'Johnson',
    businessName: 'Johnson Realty',
    phoneNumber: '555-456-7890',
    profilePicture: '/placeholder.svg',
    industry: 'Real Estate',
    bio: 'Helping families find their dream homes since 2010',
    tags: ['real estate', 'buying', 'selling', 'investments'],
    isAdmin: false,
    createdAt: new Date(),
  },
];

// Generate mock data
const generateMockData = () => {
  const referrals: Referral[] = [
    {
      id: '1',
      referringMemberId: '2',
      referredToMemberId: '3',
      description: 'Client looking to buy a home',
      date: new Date(2023, 2, 15),
      createdAt: new Date(2023, 2, 15),
    },
    {
      id: '2',
      referringMemberId: '3',
      referredToMemberId: '2',
      description: 'New homeowner needs plumbing repair',
      date: new Date(2023, 3, 10),
      createdAt: new Date(2023, 3, 10),
    },
  ];

  const visitors: Visitor[] = [
    {
      id: '1',
      hostMemberId: '3',
      visitorName: 'Sarah Wilson',
      visitorBusiness: 'Wilson Interior Design',
      visitDate: new Date(2023, 3, 18),
      createdAt: new Date(2023, 3, 15),
    },
    {
      id: '2',
      hostMemberId: '3',
      visitorName: 'Michael Brown',
      visitorBusiness: 'Brown Landscaping',
      visitDate: new Date(2023, 4, 2),
      createdAt: new Date(2023, 3, 30),
    },
  ];

  const oneToOnes: OneToOne[] = [
    {
      id: '1',
      memberOneId: '2',
      memberTwoId: '3',
      meetingDate: new Date(2023, 2, 20),
      createdAt: new Date(2023, 2, 20),
    },
    {
      id: '2',
      memberOneId: '3',
      memberTwoId: '1',
      meetingDate: new Date(2023, 3, 5),
      createdAt: new Date(2023, 3, 5),
    },
  ];

  const tyfcbs: TYFCB[] = [
    {
      id: '1',
      thankingMemberId: '2',
      thankedMemberId: '3',
      amount: 2500,
      description: 'Real estate commission for home purchase',
      date: new Date(2023, 3, 25),
      createdAt: new Date(2023, 3, 25),
    },
    {
      id: '2',
      thankingMemberId: '3',
      thankedMemberId: '2',
      amount: 1200,
      description: 'Plumbing work for new homeowner',
      date: new Date(2023, 4, 10),
      createdAt: new Date(2023, 4, 10),
    },
  ];

  const events: Event[] = [
    {
      id: '1',
      name: 'Weekly Tuesday Meeting',
      date: new Date(2023, 4, 16),
      startTime: '08:00',
      endTime: '09:30',
      location: '123 Main St, Rockville, MD',
      description: 'Regular weekly meeting',
      createdBy: '1',
      isApproved: true,
      isFeatured: true,
      isPresentationMeeting: true,
      presenter: '2',
      createdAt: new Date(2023, 3, 1),
    },
    {
      id: '2',
      name: 'Networking Social',
      date: new Date(2023, 4, 25),
      startTime: '18:00',
      endTime: '20:00',
      location: 'Rockville Town Square',
      description: 'Casual evening networking event',
      createdBy: '1',
      isApproved: true,
      isFeatured: true,
      isPresentationMeeting: false,
      createdAt: new Date(2023, 3, 15),
    },
  ];

  const polls: Poll[] = [
    {
      id: '1',
      title: 'New Member Application: Wilson Interior Design',
      description: 'Sarah Wilson has applied for membership as an Interior Designer',
      options: [
        { id: '1', text: 'Approve', votes: ['2'] },
        { id: '2', text: 'Reject', votes: [] },
      ],
      startDate: new Date(2023, 3, 20),
      endDate: new Date(2023, 4, 3),
      createdBy: '1',
      isActive: true,
      createdAt: new Date(2023, 3, 20),
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      type: 'referral',
      description: 'John Smith referred a client to Elizabeth Johnson',
      date: new Date(2023, 2, 15),
      userId: '2',
      relatedUserId: '3',
      referenceId: '1',
    },
    {
      id: '2',
      type: 'visitor',
      description: 'Elizabeth Johnson invited Sarah Wilson to visit',
      date: new Date(2023, 3, 15),
      userId: '3',
      referenceId: '1',
    },
    {
      id: '3',
      type: 'oneToOne',
      description: 'John Smith and Elizabeth Johnson had a one-to-one meeting',
      date: new Date(2023, 2, 20),
      userId: '2',
      relatedUserId: '3',
      referenceId: '1',
    },
    {
      id: '4',
      type: 'tyfcb',
      description: 'John Smith thanked Elizabeth Johnson for $2,500 in closed business',
      date: new Date(2023, 3, 25),
      userId: '2',
      relatedUserId: '3',
      referenceId: '1',
    },
  ];

  return { referrals, visitors, oneToOnes, tyfcbs, events, polls, activities };
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const mockData = generateMockData();
  
  const [referrals, setReferrals] = useState<Referral[]>(mockData.referrals);
  const [visitors, setVisitors] = useState<Visitor[]>(mockData.visitors);
  const [oneToOnes, setOneToOnes] = useState<OneToOne[]>(mockData.oneToOnes);
  const [tyfcbs, setTyfcbs] = useState<TYFCB[]>(mockData.tyfcbs);
  const [events, setEvents] = useState<Event[]>(mockData.events);
  const [polls, setPolls] = useState<Poll[]>(mockData.polls);
  const [activities, setActivities] = useState<Activity[]>(mockData.activities);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Helper function to add a new activity
  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      id: `${activities.length + 1}`,
      ...activity,
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  // Add a new referral
  const addReferral = async (referral: Omit<Referral, 'id' | 'createdAt'>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newReferral: Referral = {
      id: `${referrals.length + 1}`,
      ...referral,
      createdAt: new Date(),
    };
    
    setReferrals(prev => [newReferral, ...prev]);
    
    // Add activity
    const referringUser = users.find(u => u.id === referral.referringMemberId);
    const referredToUser = users.find(u => u.id === referral.referredToMemberId);
    
    if (referringUser && referredToUser) {
      addActivity({
        type: 'referral',
        description: `${referringUser.firstName} ${referringUser.lastName} referred a client to ${referredToUser.firstName} ${referredToUser.lastName}`,
        date: referral.date,
        userId: referral.referringMemberId,
        relatedUserId: referral.referredToMemberId,
        referenceId: newReferral.id,
      });
    }
  };

  // Add a new visitor
  const addVisitor = async (visitor: Omit<Visitor, 'id' | 'createdAt'>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newVisitor: Visitor = {
      id: `${visitors.length + 1}`,
      ...visitor,
      createdAt: new Date(),
    };
    
    setVisitors(prev => [newVisitor, ...prev]);
    
    // Add activity
    const hostUser = users.find(u => u.id === visitor.hostMemberId);
    
    if (hostUser) {
      addActivity({
        type: 'visitor',
        description: `${hostUser.firstName} ${hostUser.lastName} invited ${visitor.visitorName} from ${visitor.visitorBusiness} to visit`,
        date: new Date(),
        userId: visitor.hostMemberId,
        referenceId: newVisitor.id,
      });
    }
  };

  // Add a new one-to-one meeting
  const addOneToOne = async (oneToOne: Omit<OneToOne, 'id' | 'createdAt'>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newOneToOne: OneToOne = {
      id: `${oneToOnes.length + 1}`,
      ...oneToOne,
      createdAt: new Date(),
    };
    
    setOneToOnes(prev => [newOneToOne, ...prev]);
    
    // Add activity
    const memberOne = users.find(u => u.id === oneToOne.memberOneId);
    const memberTwo = users.find(u => u.id === oneToOne.memberTwoId);
    
    if (memberOne && memberTwo) {
      addActivity({
        type: 'oneToOne',
        description: `${memberOne.firstName} ${memberOne.lastName} and ${memberTwo.firstName} ${memberTwo.lastName} had a one-to-one meeting`,
        date: oneToOne.meetingDate,
        userId: oneToOne.memberOneId,
        relatedUserId: oneToOne.memberTwoId,
        referenceId: newOneToOne.id,
      });
    }
  };

  // Add a new TYFCB
  const addTYFCB = async (tyfcb: Omit<TYFCB, 'id' | 'createdAt'>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTYFCB: TYFCB = {
      id: `${tyfcbs.length + 1}`,
      ...tyfcb,
      createdAt: new Date(),
    };
    
    setTyfcbs(prev => [newTYFCB, ...prev]);
    
    // Add activity
    const thankingUser = users.find(u => u.id === tyfcb.thankingMemberId);
    const thankedUser = users.find(u => u.id === tyfcb.thankedMemberId);
    
    if (thankingUser && thankedUser) {
      addActivity({
        type: 'tyfcb',
        description: `${thankingUser.firstName} ${thankingUser.lastName} thanked ${thankedUser.firstName} ${thankedUser.lastName} for $${tyfcb.amount.toLocaleString()} in closed business`,
        date: tyfcb.date,
        userId: tyfcb.thankingMemberId,
        relatedUserId: tyfcb.thankedMemberId,
        referenceId: newTYFCB.id,
      });
    }
  };

  // Add a new event
  const addEvent = async (event: Omit<Event, 'id' | 'createdAt'>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newEvent: Event = {
      id: `${events.length + 1}`,
      ...event,
      createdAt: new Date(),
    };
    
    setEvents(prev => [newEvent, ...prev]);
    
    // Add activity if the event is pre-approved (by an admin)
    if (event.isApproved) {
      const creator = users.find(u => u.id === event.createdBy);
      
      if (creator) {
        addActivity({
          type: 'event',
          description: `${creator.firstName} ${creator.lastName} created a new event: ${event.name}`,
          date: new Date(),
          userId: event.createdBy,
          referenceId: newEvent.id,
        });
      }
    }
  };

  // Add a new poll
  const addPoll = async (poll: Omit<Poll, 'id' | 'createdAt'>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPoll: Poll = {
      id: `${polls.length + 1}`,
      ...poll,
      createdAt: new Date(),
    };
    
    setPolls(prev => [newPoll, ...prev]);
    
    // Add activity
    const creator = users.find(u => u.id === poll.createdBy);
    
    if (creator) {
      addActivity({
        type: 'poll',
        description: `${creator.firstName} ${creator.lastName} created a new poll: ${poll.title}`,
        date: new Date(),
        userId: poll.createdBy,
        referenceId: newPoll.id,
      });
    }
  };

  // Vote in a poll
  const voteInPoll = async (pollId: string, optionId: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser) {
      throw new Error('You must be logged in to vote');
    }
    
    // Update polls
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        // Check if user has already voted in this poll
        const hasVoted = poll.options.some(option => 
          option.votes.includes(currentUser.id)
        );
        
        if (hasVoted) {
          throw new Error('You have already voted in this poll');
        }
        
        // Update the votes for the selected option
        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return {
              ...option,
              votes: [...option.votes, currentUser.id],
            };
          }
          return option;
        });
        
        return {
          ...poll,
          options: updatedOptions,
        };
      }
      return poll;
    }));
  };

  // Approve or reject an event
  const approveEvent = async (eventId: string, isApproved: boolean) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser?.isAdmin) {
      throw new Error('Only admins can approve events');
    }
    
    // Update events
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isApproved,
        };
      }
      return event;
    }));
    
    // Add activity if the event is approved
    if (isApproved) {
      const event = events.find(e => e.id === eventId);
      
      if (event) {
        addActivity({
          type: 'event',
          description: `Event approved: ${event.name}`,
          date: new Date(),
          userId: currentUser.id,
          referenceId: eventId,
        });
      }
    }
  };

  // Feature or unfeature an event
  const featureEvent = async (eventId: string, isFeatured: boolean) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser?.isAdmin) {
      throw new Error('Only admins can feature events');
    }
    
    // Update events
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isFeatured,
        };
      }
      return event;
    }));
  };

  // Set presenter for an event
  const setPresenter = async (eventId: string, presenterId: string | undefined) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser?.isAdmin) {
      throw new Error('Only admins can set presenters');
    }
    
    // Update events
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isPresentationMeeting: !!presenterId,
          presenter: presenterId,
        };
      }
      return event;
    }));
  };

  // Delete an item
  const deleteItem = async (
    type: 'referral' | 'visitor' | 'oneToOne' | 'tyfcb' | 'event' | 'poll',
    id: string
  ) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser?.isAdmin) {
      throw new Error('Only admins can delete items');
    }
    
    // Delete the item based on type
    switch (type) {
      case 'referral':
        setReferrals(prev => prev.filter(item => item.id !== id));
        break;
      case 'visitor':
        setVisitors(prev => prev.filter(item => item.id !== id));
        break;
      case 'oneToOne':
        setOneToOnes(prev => prev.filter(item => item.id !== id));
        break;
      case 'tyfcb':
        setTyfcbs(prev => prev.filter(item => item.id !== id));
        break;
      case 'event':
        setEvents(prev => prev.filter(item => item.id !== id));
        break;
      case 'poll':
        setPolls(prev => prev.filter(item => item.id !== id));
        break;
      default:
        throw new Error('Invalid item type');
    }
    
    // Remove related activities
    setActivities(prev => prev.filter(activity => 
      activity.type !== type || activity.referenceId !== id
    ));
  };

  // Update an event
  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser?.isAdmin) {
      throw new Error('Only admins can update events');
    }
    
    // Update events
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          ...eventData,
        };
      }
      return event;
    }));
  };

  // Update a poll
  const updatePoll = async (pollId: string, pollData: Partial<Poll>) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!currentUser?.isAdmin) {
      throw new Error('Only admins can update polls');
    }
    
    // Update polls
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          ...pollData,
        };
      }
      return poll;
    }));
  };

  // Get a user by ID
  const getUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  // Get metrics for a specific user
  const getUserMetrics = (userId: string) => {
    // Count referrals
    const userReferrals = referrals.filter(
      r => r.referringMemberId === userId
    ).length;
    
    // Count visitors
    const userVisitors = visitors.filter(
      v => v.hostMemberId === userId
    ).length;
    
    // Count one-to-ones
    const userOneToOnes = oneToOnes.filter(
      o => o.memberOneId === userId || o.memberTwoId === userId
    ).length;
    
    // Sum TYFCB
    const userTYFCBs = tyfcbs.filter(
      t => t.thankingMemberId === userId
    );
    const tyfcbCount = userTYFCBs.length;
    const tyfcbAmount = userTYFCBs.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      referrals: userReferrals,
      visitors: userVisitors,
      oneToOnes: userOneToOnes,
      tyfcb: { count: tyfcbCount, amount: tyfcbAmount },
    };
  };

  // Get top performers in each category
  const getTopPerformers = () => {
    // Calculate metrics for each user
    const userMetrics = users.map(user => {
      const metrics = getUserMetrics(user.id);
      return { user, metrics };
    });
    
    // Find top referrals
    const topReferrals = userMetrics.reduce((top, current) => {
      if (!top || current.metrics.referrals > top.metrics.referrals) {
        return current;
      }
      return top;
    }, null as { user: User; metrics: ReturnType<typeof getUserMetrics> } | null);
    
    // Find top visitors
    const topVisitors = userMetrics.reduce((top, current) => {
      if (!top || current.metrics.visitors > top.metrics.visitors) {
        return current;
      }
      return top;
    }, null as { user: User; metrics: ReturnType<typeof getUserMetrics> } | null);
    
    // Find top one-to-ones
    const topOneToOnes = userMetrics.reduce((top, current) => {
      if (!top || current.metrics.oneToOnes > top.metrics.oneToOnes) {
        return current;
      }
      return top;
    }, null as { user: User; metrics: ReturnType<typeof getUserMetrics> } | null);
    
    // Find top TYFCB
    const topTYFCB = userMetrics.reduce((top, current) => {
      if (!top || current.metrics.tyfcb.amount > top.metrics.tyfcb.amount) {
        return current;
      }
      return top;
    }, null as { user: User; metrics: ReturnType<typeof getUserMetrics> } | null);
    
    return {
      topReferrals: topReferrals ? { user: topReferrals.user, count: topReferrals.metrics.referrals } : null,
      topVisitors: topVisitors ? { user: topVisitors.user, count: topVisitors.metrics.visitors } : null,
      topOneToOnes: topOneToOnes ? { user: topOneToOnes.user, count: topOneToOnes.metrics.oneToOnes } : null,
      topTYFCB: topTYFCB ? { user: topTYFCB.user, amount: topTYFCB.metrics.tyfcb.amount } : null,
    };
  };

  return (
    <DataContext.Provider
      value={{
        referrals,
        visitors,
        oneToOnes,
        tyfcbs,
        events,
        polls,
        activities,
        users,
        addReferral,
        addVisitor,
        addOneToOne,
        addTYFCB,
        addEvent,
        addPoll,
        voteInPoll,
        approveEvent,
        featureEvent,
        setPresenter,
        deleteItem,
        updateEvent,
        updatePoll,
        getUser,
        getUserMetrics,
        getTopPerformers,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
