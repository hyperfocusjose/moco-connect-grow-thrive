
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
    markVisitorNoShow
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
      cleanupActivities();
      cleanupPolls();
    };
  }, [cleanupUsers, cleanupEvents, cleanupActivities, cleanupPolls]);

  // Wrap the fetchEvents function to match the DataContextType
  const wrappedFetchEvents = async (): Promise<void> => {
    await fetchEvents();
    // We ignore the return value since the DataContextType expects Promise<void>
  };

  // Wrap the fetchActivities function in the same way
  const wrappedFetchActivities = async (): Promise<void> => {
    await fetchActivities();
    // We ignore the return value since the DataContextType expects Promise<void>
  };

  // Wrap the fetchUsers function in the same way
  const wrappedFetchUsers = async (): Promise<void> => {
    await fetchUsers();
    // We ignore the return value since the DataContextType expects Promise<void>
  };

  // Wrap the fetchPolls function in the same way
  const wrappedFetchPolls = async (): Promise<void> => {
    await fetchPolls();
    // We ignore the return value since the DataContextType expects Promise<void>
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
      fetchPolls: wrappedFetchPolls,
      // Loading and error states
      isLoading: usersLoading || eventsLoading || activitiesLoading || pollsLoading,
      loadError: usersError || eventsError || activitiesError || pollsError,
      resetFetchState: () => {
        resetUsersState();
        resetEventsState();
        resetActivitiesState();
      }
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
