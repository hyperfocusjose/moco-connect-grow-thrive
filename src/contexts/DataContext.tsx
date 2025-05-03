import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUsers } from '@/hooks/data/useUsers';
import { useEvents } from '@/hooks/data/useEvents';
import { useVisitors } from '@/hooks/data/useVisitors';
import { useActivities } from '@/hooks/data/useActivities';
import { useMetrics } from '@/hooks/data/useMetrics';
import { usePollOperations } from '@/hooks/data/usePollOperations';
import { DataContextType } from '@/types';

const DataContext = createContext<DataContextType>({} as DataContextType);
export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const {
    users, getUser, addUser, updateUser,
    fetchUsers, isLoading: usersLoading, loadError: usersError,
    resetFetchState: resetUsers, cleanup: cleanupUsers
  } = useUsers();

  const {
    events, createEvent, updateEvent, deleteEvent,
    fetchEvents, isLoading: eventsLoading, loadError: eventsError,
    resetFetchState: resetEvents, cleanup: cleanupEvents
  } = useEvents();

  const {
    visitors, addVisitor, updateVisitor, markVisitorNoShow,
    fetchVisitors, isLoading: visitorsLoading, loadError: visitorsError,
    resetFetchState: resetVisitors, cleanup: cleanupVisitors
  } = useVisitors();

  const {
    activities, referrals, oneToOnes, tyfcbs,
    addReferral, addOneToOne, addTYFCB,
    fetchActivities, isLoading: activitiesLoading, loadError: activitiesError,
    resetFetchState: resetActivities, cleanup: cleanupActivities
  } = useActivities();

  const {
    polls, createPoll, updatePoll, deletePoll, votePoll, hasVoted,
    fetchPolls, isLoading: pollsLoading, loadError: pollsError,
    cleanup: cleanupPolls
  } = usePollOperations();

  const {
    stats, getUserMetrics, getTopPerformers, getActivityForAllMembers
  } = useMetrics({ users, referrals, visitors, oneToOnes, tyfcbs });

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchEvents(),
          fetchVisitors(),
          fetchActivities(),
          fetchPolls()
        ]);
      } catch (error) {
        console.error('DataContext initialization failed:', error);
      } finally {
        setInitialLoadComplete(true);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    return () => {
      cleanupUsers();
      cleanupEvents();
      cleanupVisitors();
      cleanupActivities();
      cleanupPolls();
    };
  }, []);

  useEffect(() => {
    console.log('DataContext state debug:', {
      users: users.length,
      events: events.length,
      visitors: visitors.length,
      activities: activities.length,
      polls: polls.length
    });
  }, [users, events, visitors, activities, polls]);

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
      isLoading:
        !initialLoadComplete ||
        usersLoading || eventsLoading || visitorsLoading || activitiesLoading || pollsLoading,
      loadError:
        usersError || eventsError || visitorsError || activitiesError || pollsError,
      resetFetchState: () => {
        resetUsers();
        resetEvents();
        resetVisitors();
        resetActivities();
      }
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;