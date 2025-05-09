import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useUsers } from '@/hooks/data/useUsers';
import { useEvents } from '@/hooks/data/useEvents';
import { useVisitors } from '@/hooks/data/useVisitors';
import { useActivities } from '@/hooks/data/useActivities';
import { useMetrics } from '@/hooks/data/useMetrics';
import { usePollOperations } from '@/hooks/data/usePollOperations';
import { DataContextType, Referral, OneToOne, TYFCB } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Initialize with empty data arrays
const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initialLoadCompleteRef = useRef(false);
  const { isAuthenticated, sessionValid, refreshSession } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { 
    users, 
    getUser, 
    addUser, 
    updateUser,
    fetchUsers,
    isLoading: usersLoading,
    loadError: usersError,
    authError: usersAuthError,
    fetchAttempted: usersFetchAttempted,
    resetFetchState: resetUsersState,
    cleanup: cleanupUsers,
    rawProfileData
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

  // Check authentication status before attempting data load
  const verifyAuthBeforeLoad = useCallback(async (): Promise<boolean> => {
    console.log("DataContext: Verifying authentication before loading data");
    
    // Output detailed diagnostic info on auth state
    console.log("DataContext: Auth state details:", {
      isAuthenticated,
      sessionValid,
      sessionInfo: await supabase.auth.getSession()
        .then(({data}) => ({
          hasSession: !!data.session,
          expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'No session',
          currentTime: new Date().toISOString()
        }))
        .catch(e => ({error: e.message}))
    });
    
    // Check current auth status
    if (!isAuthenticated || !sessionValid) {
      // Try to refresh the session
      console.log("DataContext: Authentication state invalid, attempting to refresh session");
      const refreshSuccessful = await refreshSession();
      
      if (!refreshSuccessful) {
        console.error("DataContext: Not authenticated, cannot load data");
        setAuthError("Authentication required. Please log in to access data.");
        
        // Check if we need to notify the user about authentication issues
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast.error("Authentication required. Please log in to access data.");
          return false;
        }
      }
    }
    
    setAuthError(null);
    return true;
  }, [isAuthenticated, sessionValid, refreshSession]);

  // Create a single coordinated data fetch function to load all data
  const loadAllData = useCallback(async () => {
    console.log("DataContext: Starting coordinated data load");
    
    try {
      // Verify authentication first
      const isAuthed = await verifyAuthBeforeLoad();
      if (!isAuthed) {
        console.log("DataContext: Aborting data load due to authentication failure");
        return;
      }
      
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
  }, [fetchUsers, fetchEvents, fetchVisitors, fetchActivities, fetchPolls, verifyAuthBeforeLoad]);

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

  // Add effect to handle auth state changes
  useEffect(() => {
    if (isAuthenticated && sessionValid && initialLoadCompleteRef.current) {
      // If we become authenticated and already did the initial load, reload data
      loadAllData();
    }
  }, [isAuthenticated, sessionValid, loadAllData]);

  // Diagnostic logging
  useEffect(() => {
    console.log("DataContext: Data state changed -", 
      "Users:", users.length, 
      "Auth:", isAuthenticated && sessionValid ? "Valid" : "Invalid",
      "User fetch attempted:", usersFetchAttempted,
      "Loading:", usersLoading || isInitialLoad
    );
  }, [
    users.length, 
    isAuthenticated, 
    sessionValid,
    usersFetchAttempted,
    usersLoading,
    isInitialLoad
  ]);

  const reloadData = useCallback(async () => {
    console.log("DataContext: Manual reload triggered");
    await loadAllData();
  }, [loadAllData]);

  const combinedLoadError = usersAuthError || authError || usersError || eventsError || activitiesError || visitorsError || pollsError;

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
      rawProfileData,
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
