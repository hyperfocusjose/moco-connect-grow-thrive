
import React, { createContext, useContext, useEffect } from 'react';
import { useUsers } from '@/hooks/data/useUsers';
import { useEvents } from '@/hooks/data/useEvents';
import { useVisitors } from '@/hooks/data/useVisitors';
import { useActivities } from '@/hooks/data/useActivities';
import { useMetrics } from '@/hooks/data/useMetrics';
import { usePollOperations } from '@/hooks/data/usePollOperations';
import { DataContextType } from '@/types';

// Initialize with empty data arrays
const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    users, 
    getUser, 
    addUser, 
    updateUser,
    fetchUsers,
    isLoading: usersLoading,
    loadError: usersError,
    resetFetchState: resetUsersState,
    cleanup: cleanupUsers
  } = useUsers();

  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    isLoading: eventsLoading,
    loadError: eventsError,
    resetFetchState: resetEventsState,
    cleanup: cleanupEvents
  } = useEvents();

  const {
    visitors,
    addVisitor,
    updateVisitor,
    markVisitorNoShow,
    fetchVisitors,
    isLoading: visitorsLoading,
    loadError: visitorsError,
    resetFetchState: resetVisitorsState,
    cleanup: cleanupVisitors
  } = useVisitors();

  const {
    activities,
    referrals,
    oneToOnes,
    tyfcbs,
    addReferral,
    addOneToOne,
    addTYFCB,
    fetchActivities,
    isLoading: activitiesLoading,
    loadError: activitiesError,
    resetFetchState: resetActivitiesState,
    cleanup: cleanupActivities
  } = useActivities();

  const {
    polls,
    createPoll,
    updatePoll,
    deletePoll,
    votePoll,
    hasVoted,
    isLoading: pollsLoading,
    loadError: pollsError,
    fetchPolls,
    cleanup: cleanupPolls
  } = usePollOperations();

  const {
    stats,
    getUserMetrics,
    getTopPerformers,
    getActivityForAllMembers
  } = useMetrics({ users, referrals, visitors, oneToOnes, tyfcbs });

  // Handle component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cleanupUsers();
      cleanupEvents();
      cleanupVisitors();
      cleanupActivities();
      cleanupPolls();
    };
  }, [cleanupUsers, cleanupEvents, cleanupVisitors, cleanupActivities, cleanupPolls]);

  // Wrap the hook functions to match DataContextType's Promise<void> return types
  const wrappedFetchUsers = async (): Promise<void> => {
    try {
      console.log("DataContext: wrapping fetchUsers call");
      await fetchUsers();
    } catch (error) {
      console.error("Error in wrappedFetchUsers:", error);
    }
  };

  const wrappedFetchEvents = async (): Promise<void> => {
    try {
      console.log("DataContext: wrapping fetchEvents call");
      await fetchEvents();
    } catch (error) {
      console.error("Error in wrappedFetchEvents:", error);
    }
  };

  const wrappedFetchActivities = async (): Promise<void> => {
    try {
      console.log("DataContext: wrapping fetchActivities call");
      await fetchActivities();
    } catch (error) {
      console.error("Error in wrappedFetchActivities:", error);
    }
  };

  const wrappedFetchVisitors = async (): Promise<void> => {
    try {
      console.log("DataContext: wrapping fetchVisitors call");
      await fetchVisitors();
    } catch (error) {
      console.error("Error in wrappedFetchVisitors:", error);
    }
  };

  const wrappedFetchPolls = async (): Promise<void> => {
    try {
      console.log("DataContext: wrapping fetchPolls call");
      await fetchPolls();
    } catch (error) {
      console.error("Error in wrappedFetchPolls:", error);
    }
  };

  // Diagnostic logging
  useEffect(() => {
    console.log("DataContext: Users count:", users.length);
    console.log("DataContext: Events count:", events.length);
    console.log("DataContext: Visitors count:", visitors.length);
    console.log("DataContext: Activities count:", activities.length);
    console.log("DataContext: Polls count:", polls.length);
  }, [users.length, events.length, visitors.length, activities.length, polls.length]);

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
      fetchEvents: wrappedFetchEvents,
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
      fetchUsers: wrappedFetchUsers,
      fetchActivities: wrappedFetchActivities,
      fetchVisitors: wrappedFetchVisitors,
      fetchPolls: wrappedFetchPolls,
      // Loading and error states
      isLoading: usersLoading || eventsLoading || activitiesLoading || visitorsLoading || pollsLoading,
      loadError: usersError || eventsError || activitiesError || visitorsError || pollsError,
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
