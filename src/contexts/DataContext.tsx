import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUsers } from '@/hooks/data/useDemoUsers';
import { useEvents } from '@/hooks/data/useDemoEvents';
import { useVisitors } from '@/hooks/data/useDemoVisitors';
import { useActivities } from '@/hooks/data/useDemoActivities';
import { useMetrics } from '@/hooks/data/useMetrics';
import { usePollOperations } from '@/hooks/data/useDemoPolls';
import { DataContextType, Referral, OneToOne, TYFCB, Event, Visitor, Poll } from '@/types';
// Demo data doesn't need authentication

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { 
    users, 
    getUser, 
    addUser, 
    updateUser,
    fetchUsers,
    isLoading: usersLoading,
    loadError: usersError,
    debugInfo,
    resetFetchState: resetUsersState
  } = useUsers();

  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    isLoading: eventsLoading,
    loadError: eventsError,
    resetFetchState: resetEventsState
  } = useEvents();

  const {
    visitors,
    addVisitor,
    updateVisitor,
    markVisitorNoShow,
    fetchVisitors,
    isLoading: visitorsLoading,
    loadError: visitorsError,
    resetFetchState: resetVisitorsState
  } = useVisitors();

  const {
    activities,
    referrals,
    oneToOnes,
    tyfcbs,
    addReferral: addReferralOriginal,
    addOneToOne: addOneToOneOriginal,
    addTYFCB: addTYFCBOriginal,
    fetchActivities,
    isLoading: activitiesLoading,
    loadError: activitiesError,
    resetFetchState: resetActivitiesState
  } = useActivities();

  const addReferral = async (referral: Partial<Referral>): Promise<void> => {
    await addReferralOriginal(referral);
  };

  const addOneToOne = async (oneToOne: Partial<OneToOne>): Promise<void> => {
    await addOneToOneOriginal(oneToOne);
  };

  const addTYFCB = async (tyfcb: Partial<TYFCB>): Promise<void> => {
    await addTYFCBOriginal(tyfcb);
  };

  // Wrapper functions to match DataContextType signatures
  const createEventWrapper = async (event: Partial<Event>): Promise<void> => {
    await createEvent(event);
  };

  const addVisitorWrapper = async (visitor: Partial<Visitor>): Promise<void> => {
    await addVisitor(visitor);
  };

  const createPollWrapper = async (poll: Partial<Poll>): Promise<void> => {
    await createPoll(poll);
  };

  const {
    polls,
    createPoll,
    updatePoll,
    deletePoll,
    votePoll,
    hasVoted,
    isLoading: pollsLoading,
    loadError: pollsError,
    fetchPolls
  } = usePollOperations();

  const {
    stats,
    getUserMetrics,
    getTopPerformers,
    getActivityForAllMembers
  } = useMetrics({ users, referrals, visitors, oneToOnes, tyfcbs });

  // Simple data reload function
  const reloadData = useCallback(async () => {
    console.log("DataContext: Manual reload triggered");
    await Promise.allSettled([
      fetchUsers(),
      fetchEvents(),
      fetchVisitors(),
      fetchActivities(),
      fetchPolls()
    ]);
  }, [fetchUsers, fetchEvents, fetchVisitors, fetchActivities, fetchPolls]);

  // Set initial load to false once we have attempted to load data
  useEffect(() => {
    if (usersLoading === false) {
      setIsInitialLoad(false);
    }
  }, [usersLoading]);

  const combinedLoadError = usersError || eventsError || activitiesError || visitorsError || pollsError;

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
      createEvent: createEventWrapper,
      updateEvent,
      deleteEvent,
      fetchEvents,
      getUserMetrics,
      addVisitor: addVisitorWrapper,
      updateVisitor,
      addReferral,
      addOneToOne,
      addTYFCB,
      createPoll: createPollWrapper,
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
      fetchVisitors,
      fetchPolls,
      reloadData,
      rawProfileData: [],
      // Loading and error states
      isLoading: usersLoading || eventsLoading || activitiesLoading || visitorsLoading || pollsLoading || isInitialLoad,
      loadError: combinedLoadError,
      resetFetchState: () => {
        resetUsersState();
        resetEventsState();
        resetActivitiesState();
        resetVisitorsState();
      }
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
