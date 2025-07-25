import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUsers } from '@/hooks/data/useUsers';
import { useEvents } from '@/hooks/data/useEvents';
import { useVisitors } from '@/hooks/data/useVisitors';
import { useActivities } from '@/hooks/data/useActivities';
import { useMetrics } from '@/hooks/data/useMetrics';
import { usePollOperations } from '@/hooks/data/usePollOperations';
import { DataContextType, Referral, OneToOne, TYFCB } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { isAuthenticated } = useAuth();
  
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
    if (!isAuthenticated) return;
    
    console.log("DataContext: Manual reload triggered");
    await Promise.allSettled([
      fetchUsers(),
      fetchEvents(),
      fetchVisitors(),
      fetchActivities(),
      fetchPolls()
    ]);
  }, [isAuthenticated, fetchUsers, fetchEvents, fetchVisitors, fetchActivities, fetchPolls]);

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
      createEvent,
      updateEvent,
      deleteEvent,
      fetchEvents,
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
      fetchVisitors,
      fetchPolls,
      reloadData,
      rawProfileData: debugInfo?.profilesData || [],
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
