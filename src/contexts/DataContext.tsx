
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Event, Visitor, Referral, OneToOne, TYFCB, Activity, Poll } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Initialize with empty data arrays
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
  getUser: (userId: string | undefined) => User | undefined;
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
  markVisitorNoShow: (id: string) => Promise<void>;
  getActivityForAllMembers: () => Record<string, any>[];
  fetchUsers: () => Promise<void>;
  fetchActivities: () => Promise<void>;
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
  markVisitorNoShow: async () => {},
  getActivityForAllMembers: () => [],
  fetchUsers: async () => {},
  fetchActivities: async () => {},
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

  // Fetch users from Supabase on component mount
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, member_tags(tag), user_roles(role)');
      
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No user profiles found');
        return;
      }

      // Transform the data to match the User type
      const transformedUsers: User[] = data
        .filter(profile => {
          // Filter out profiles with no first name or last name (incomplete profiles)
          return profile.first_name && profile.last_name;
        })
        .map(profile => {
          // Extract tags from the member_tags relation
          const tags = profile.member_tags ? 
            profile.member_tags.map((tagObj: any) => tagObj.tag) : 
            [];
          
          // Check if user has admin role - safely handle potential errors
          const isAdmin = profile.user_roles && Array.isArray(profile.user_roles) ? 
            profile.user_roles.some((role: any) => role.role === 'admin') : 
            false;
          
          return {
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            phoneNumber: profile.phone_number || '',
            businessName: profile.business_name || '',
            industry: profile.industry || '',
            bio: profile.bio || '',
            tags: tags,
            profilePicture: profile.profile_picture || '',
            isAdmin: isAdmin,
            website: profile.website || '',
            linkedin: profile.linkedin || '',
            facebook: profile.facebook || '',
            tiktok: profile.tiktok || '',
            instagram: profile.instagram || '',
            createdAt: new Date(profile.created_at),
          };
        });
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    }
  }, []);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }
      
      if (data) {
        const transformedActivities: Activity[] = data.map(activity => ({
          id: activity.id,
          // Cast the string type to the expected union type
          type: activity.type as Activity['type'],
          description: activity.description,
          date: new Date(activity.date),
          userId: activity.user_id,
          relatedUserId: activity.related_user_id,
          referenceId: activity.reference_id,
        }));
        
        setActivities(transformedActivities);
      }
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
      await fetchActivities();
      
      // Fetch events from Supabase on component mount
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
      
      // Fetch visitors
      const fetchVisitors = async () => {
        try {
          const { data, error } = await supabase
            .from('visitors')
            .select('*')
            .order('visit_date', { ascending: false });
          
          if (error) {
            console.error('Error fetching visitors:', error);
            return;
          }
          
          // Transform the data to match the Visitor type
          const transformedVisitors: Visitor[] = data.map(visitor => ({
            id: visitor.id,
            visitorName: visitor.visitor_name,
            visitorBusiness: visitor.visitor_business,
            visitDate: new Date(visitor.visit_date),
            hostMemberId: visitor.host_member_id || undefined,
            isSelfEntered: visitor.is_self_entered || false,
            phoneNumber: visitor.phone_number || undefined,
            email: visitor.email || undefined,
            industry: visitor.industry || undefined,
            createdAt: new Date(visitor.created_at),
            didNotShow: visitor.did_not_show || false,
          }));
          
          setVisitors(transformedVisitors);
        } catch (error) {
          console.error('Error in fetchVisitors:', error);
        }
      };
      
      fetchEvents();
      fetchVisitors();
    };
    
    fetchData();
  }, [fetchUsers, fetchActivities]);

  // Remove demo stats; default to empty object, provide dummy implementations.
  const stats = {};

  const getUser = (userId: string | undefined) => {
    if (!userId) return undefined;
    return users.find(user => user.id === userId);
  };

  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    return Promise.resolve();
  };

  const updateUser = async (id: string, updatedUserData: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updatedUserData.firstName,
          last_name: updatedUserData.lastName,
          phone_number: updatedUserData.phoneNumber,
          business_name: updatedUserData.businessName,
          industry: updatedUserData.industry,
          bio: updatedUserData.bio,
          profile_picture: updatedUserData.profilePicture,
          website: updatedUserData.website,
          linkedin: updatedUserData.linkedin,
          facebook: updatedUserData.facebook,
          tiktok: updatedUserData.tiktok,
          instagram: updatedUserData.instagram,
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Handle tags update if tags are provided
      if (updatedUserData.tags) {
        // First, delete all existing tags for this user
        const { error: deleteError } = await supabase
          .from('member_tags')
          .delete()
          .eq('member_id', id);
        
        if (deleteError) {
          throw deleteError;
        }
        
        // Then insert new tags
        const tagInserts = updatedUserData.tags.map(tag => ({
          member_id: id,
          tag: tag
        }));
        
        if (tagInserts.length > 0) {
          const { error: insertError } = await supabase
            .from('member_tags')
            .insert(tagInserts);
          
          if (insertError) {
            throw insertError;
          }
        }
      }
      
      // Update local state
      setUsers(prev => 
        prev.map(user => user.id === id ? { ...user, ...updatedUserData } : user)
      );
      
      // Refresh users to ensure we have the latest data
      await fetchUsers();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return Promise.reject(error);
    }
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
    // Calculate metrics based on actual data
    const userReferrals = referrals.filter(r => r.fromMemberId === userId);
    const userVisitors = visitors.filter(v => v.hostMemberId === userId && !v.didNotShow);
    const userOneToOnes = oneToOnes.filter(
      o => o.member1Id === userId || o.member2Id === userId
    );
    const userTYFCB = tyfcbs.filter(t => t.fromMemberId === userId);
    
    const totalTYFCBAmount = userTYFCB.reduce((sum, curr) => sum + Number(curr.amount || 0), 0);
    
    // Ensure we return a properly structured object with all expected properties
    return {
      referrals: userReferrals.length,
      visitors: userVisitors.length,
      oneToOnes: userOneToOnes.length,
      tyfcb: {
        amount: totalTYFCBAmount,
        count: userTYFCB.length
      }
    };
  };

  const addVisitor = async (visitor: Partial<Visitor>) => {
    try {
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
        didNotShow: false,
      };

      const { error } = await supabase.from('visitors').insert({
        id: newVisitor.id,
        visitor_name: newVisitor.visitorName,
        visitor_business: newVisitor.visitorBusiness,
        visit_date: newVisitor.visitDate.toISOString(),
        host_member_id: newVisitor.hostMemberId,
        is_self_entered: newVisitor.isSelfEntered,
        phone_number: newVisitor.phoneNumber,
        email: newVisitor.email,
        industry: newVisitor.industry,
        created_at: newVisitor.createdAt.toISOString(),
        did_not_show: newVisitor.didNotShow,
      });

      if (error) {
        console.error('Error adding visitor:', error);
        toast.error('Failed to add visitor');
        return;
      }

      setVisitors(prev => [...prev, newVisitor]);
      toast.success('Visitor added successfully');
    } catch (error) {
      console.error('Error in addVisitor:', error);
      toast.error('Failed to add visitor');
    }
  };

  const updateVisitor = async (id: string, visitor: Partial<Visitor>) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({
          visitor_name: visitor.visitorName,
          visitor_business: visitor.visitorBusiness,
          visit_date: visitor.visitDate?.toISOString(),
          host_member_id: visitor.hostMemberId,
          is_self_entered: visitor.isSelfEntered,
          phone_number: visitor.phoneNumber,
          email: visitor.email,
          industry: visitor.industry,
          did_not_show: visitor.didNotShow,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating visitor:', error);
        toast.error('Failed to update visitor');
        return;
      }

      setVisitors(prev => 
        prev.map(item => item.id === id ? { ...item, ...visitor } : item)
      );
      toast.success('Visitor updated successfully');
    } catch (error) {
      console.error('Error in updateVisitor:', error);
      toast.error('Failed to update visitor');
    }
  };

  const markVisitorNoShow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ did_not_show: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking visitor as no-show:', error);
        toast.error('Failed to mark visitor as no-show');
        return;
      }

      setVisitors(prev =>
        prev.map(visitor =>
          visitor.id === id ? { ...visitor, didNotShow: true } : visitor
        )
      );
      
      toast.success('Visitor marked as no-show');
    } catch (error) {
      console.error('Error in markVisitorNoShow:', error);
      toast.error('Failed to mark visitor as no-show');
    }
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
    const memberPerformance = users.map(user => {
      const metrics = getUserMetrics(user.id);
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        referrals: metrics.referrals,
        visitors: metrics.visitors,
        oneToOnes: metrics.oneToOnes,
        tyfcb: metrics.tyfcb,
      };
    });

    const sortedByReferrals = [...memberPerformance].sort((a, b) => b.referrals - a.referrals);
    const sortedByVisitors = [...memberPerformance].sort((a, b) => b.visitors - a.visitors);
    const sortedByOneToOnes = [...memberPerformance].sort((a, b) => b.oneToOnes - a.oneToOnes);
    const sortedByTYFCB = [...memberPerformance].sort((a, b) => b.tyfcb.amount - a.tyfcb.amount);

    return {
      referrals: sortedByReferrals.slice(0, 5),
      visitors: sortedByVisitors.slice(0, 5),
      oneToOnes: sortedByOneToOnes.slice(0, 5),
      tyfcb: sortedByTYFCB.slice(0, 5),
    };
  };

  const getActivityForAllMembers = () => {
    return users.map(user => {
      const metrics = getUserMetrics(user.id);
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        metrics,
      };
    });
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
      markVisitorNoShow,
      getActivityForAllMembers,
      fetchUsers,
      fetchActivities,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
