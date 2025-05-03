
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
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

  // When we load the app first time, do a coordinated fetch of all data
  useEffect(() => {
    if (isInitialLoad) {
      console.log("DataContext: Starting initial coordinated data load");
      setIsInitialLoad(false);
      
      const loadData = async () => {
        try {
          console.log("DataContext: Loading users...");
          await fetchUsers();
          console.log("DataContext: Loading events...");
          await fetchEvents();
          console.log("DataContext: Loading visitors...");
          await fetchVisitors();
          console.log("DataContext: Loading activities...");
          await fetchActivities();
          console.log("DataContext: Loading polls...");
          await fetchPolls();
          console.log("DataContext: Initial data load complete");
        } catch (error) {
          console.error("DataContext: Error during initial data load:", error);
        }
      };
      
      loadData();
    }
  }, [isInitialLoad, fetchUsers, fetchEvents, fetchVisitors, fetchActivities, fetchPolls]);

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

  // Diagnostic logging
  useEffect(() => {
    console.log("DataContext: Data state changed -", 
      "Users:", users.length, 
      "Events:", events.length, 
      "Visitors:", visitors.length, 
      "Activities:", activities.length,
      "Polls:", polls.length,
      "Loading:", usersLoading || eventsLoading || visitorsLoading || activitiesLoading || pollsLoading || isInitialLoad
    );
  }, [
    users.length, events.length, visitors.length, activities.length, polls.length,
    usersLoading, eventsLoading, visitorsLoading, activitiesLoading, pollsLoading, isInitialLoad
  ]);

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
      // Loading and error states
      isLoading: usersLoading || eventsLoading || activitiesLoading || visitorsLoading || pollsLoading || isInitialLoad,
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
