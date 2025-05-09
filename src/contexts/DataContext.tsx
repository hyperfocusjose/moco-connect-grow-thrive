
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  const initialLoadCompleteRef = useRef(false);
  
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
    addReferral: addReferralOriginal,
    addOneToOne: addOneToOneOriginal,
    addTYFCB: addTYFCBOriginal,
    fetchActivities,
    isLoading: activitiesLoading,
    loadError: activitiesError,
    resetFetchState: resetActivitiesState,
    cleanup: cleanupActivities
  } = useActivities();

  // Wrap the original functions to match the expected void return type
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
    fetchPolls,
    cleanup: cleanupPolls
  } = usePollOperations();

  const {
    stats,
    getUserMetrics,
    getTopPerformers,
    getActivityForAllMembers
  } = useMetrics({ users, referrals, visitors, oneToOnes, tyfcbs });

  // Create a single coordinated data fetch function to load all data
  const loadAllData = useCallback(async () => {
    console.log("DataContext: Starting coordinated data load");
    
    try {
      // Set loading state to true for the data context
      setIsInitialLoad(true);
      
      // Fetch all data in parallel with proper error handling
      await Promise.all([
        fetchUsers().catch(err => console.error("Error fetching users:", err)),
        fetchEvents().catch(err => console.error("Error fetching events:", err)),
        fetchVisitors().catch(err => console.error("Error fetching visitors:", err)),
        fetchActivities().catch(err => console.error("Error fetching activities:", err)),
        fetchPolls().catch(err => console.error("Error fetching polls:", err))
      ]);
      
      console.log("DataContext: Initial coordinated data load complete");
      initialLoadCompleteRef.current = true;
    } catch (error) {
      console.error("DataContext: Unhandled error during data load:", error);
    } finally {
      // Always set loading state to false once we're done
      setIsInitialLoad(false);
    }
  }, [fetchUsers, fetchEvents, fetchVisitors, fetchActivities, fetchPolls]);

  // When the app first loads, do a coordinated fetch of all data
  useEffect(() => {
    if (!initialLoadCompleteRef.current) {
      loadAllData();
    }
    
    // Set up a refresh interval to periodically reload data
    const refreshInterval = setInterval(() => {
      // Only refresh if we've completed the initial load
      if (initialLoadCompleteRef.current) {
        console.log("DataContext: Performing periodic data refresh");
        loadAllData();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [loadAllData]);

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

  const reloadData = useCallback(async () => {
    console.log("DataContext: Manual reload triggered");
    await loadAllData();
  }, [loadAllData]);

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
      reloadData, // New utility function to manually reload all data
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
