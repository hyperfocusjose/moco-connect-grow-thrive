import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Referral, OneToOne, TYFCB } from '@/types';
import { toast } from 'sonner';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [oneToOnes, setOneToOnes] = useState<OneToOne[]>([]);
  const [tyfcbs, setTYFCBs] = useState<TYFCB[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchActivities = useCallback(async () => {
    // Prevent fetching if already loading
    if (isLoading) return false;
    
    // Implement a simple cooldown to prevent rapid refetching
    const now = Date.now();
    const cooldownPeriod = 5000; // 5 seconds cooldown
    if (now - lastFetchTimeRef.current < cooldownPeriod) {
      console.log('Activities fetch cooldown active, skipping request');
      return false;
    }
    
    // Track fetch attempts and implement exponential backoff
    fetchAttemptRef.current += 1;
    const maxRetries = 3;
    if (fetchAttemptRef.current > maxRetries) {
      // Only show error toast on the first time we hit max retries
      if (fetchAttemptRef.current === maxRetries + 1) {
        setLoadError('Too many failed attempts to load activities. Please try again later.');
        toast.error('Activities could not be loaded', { 
          description: 'Check your network connection and try again later.',
          id: 'activities-load-error' // This prevents duplicate toasts
        });
      }
      console.warn(`Activities fetch exceeded ${maxRetries} attempts, stopping`);
      return false;
    }

    // Only show loading state on first attempt 
    if (fetchAttemptRef.current === 1) {
      setIsLoading(true);
    }
    
    lastFetchTimeRef.current = now;

    try {
      console.log('Fetching activities...');
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
        
      if (!isMountedRef.current) return false;
        
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        setLoadError(activitiesError.message);
        
        // Only show toast on first error
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load activities', {
            id: 'activities-load-error'
          });
        }
        return false;
      }
      
      if (activitiesData) {
        console.log('Activities data received:', activitiesData.length, 'records');
        const transformedActivities: Activity[] = activitiesData.map(activity => ({
          id: activity.id,
          type: activity.type as Activity['type'],
          description: activity.description,
          date: new Date(activity.date),
          userId: activity.user_id,
          relatedUserId: activity.related_user_id,
          referenceId: activity.reference_id,
        }));
        
        setActivities(transformedActivities);
      }

      // Fetch all referrals in one batch operation
      const allData = await Promise.allSettled([
        fetchReferralsData(),
        fetchOneToOnesData(),
        fetchTYFCBsData()
      ]);
      
      console.log('All data fetches completed:', allData.map(r => r.status));
      
      // Reset error state and fetch attempts on success
      setLoadError(null);
      fetchAttemptRef.current = 0;
      return true;
    } catch (error) {
      console.error('Error in fetchActivities:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      
      // Only show toast on first error
      if (fetchAttemptRef.current === 1) {
        toast.error('Failed to load activities data', {
          id: 'activities-load-error' 
        });
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  // Helper function to fetch referrals
  const fetchReferralsData = async () => {
    try {
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('date', { ascending: false });
        
      if (!isMountedRef.current) return null;
      
      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        return null;
      } else if (referralsData) {
        console.log('Referrals data received:', referralsData.length, 'records');
        const transformedReferrals: Referral[] = referralsData.map(referral => ({
          id: referral.id,
          fromMemberId: referral.from_member_id,
          fromMemberName: referral.from_member_name,
          toMemberId: referral.to_member_id,
          toMemberName: referral.to_member_name,
          description: referral.description,
          date: new Date(referral.date),
          createdAt: new Date(referral.created_at),
        }));
        
        setReferrals(transformedReferrals);
        return transformedReferrals;
      }
      return null;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return null;
    }
  };

  // Helper function to fetch one-to-ones
  const fetchOneToOnesData = async () => {
    try {
      const { data: oneToOnesData, error: oneToOnesError } = await supabase
        .from('one_to_ones')
        .select('*')
        .order('date', { ascending: false });
        
      if (!isMountedRef.current) return null;
      
      if (oneToOnesError) {
        console.error('Error fetching one-to-ones:', oneToOnesError);
        return null;
      } else if (oneToOnesData) {
        console.log('One-to-ones data received:', oneToOnesData.length, 'records');
        const transformedOneToOnes: OneToOne[] = oneToOnesData.map(oneToOne => ({
          id: oneToOne.id,
          member1Id: oneToOne.member1_id,
          member1Name: oneToOne.member1_name,
          member2Id: oneToOne.member2_id,
          member2Name: oneToOne.member2_name,
          date: new Date(oneToOne.date),
          notes: oneToOne.notes,
          createdAt: new Date(oneToOne.created_at),
        }));
        
        setOneToOnes(transformedOneToOnes);
        return transformedOneToOnes;
      }
      return null;
    } catch (error) {
      console.error('Error fetching one-to-ones:', error);
      return null;
    }
  };

  // Helper function to fetch TYFCBs
  const fetchTYFCBsData = async () => {
    try {
      const { data: tyfcbsData, error: tyfcbsError } = await supabase
        .from('tyfcb')
        .select('*')
        .order('date', { ascending: false });
        
      if (!isMountedRef.current) return null;
      
      if (tyfcbsError) {
        console.error('Error fetching TYFCBs:', tyfcbsError);
        return null;
      } else if (tyfcbsData) {
        console.log('TYFCBs data received:', tyfcbsData.length, 'records');
        const transformedTYFCBs: TYFCB[] = tyfcbsData.map(tyfcb => ({
          id: tyfcb.id,
          fromMemberId: tyfcb.from_member_id,
          fromMemberName: tyfcb.from_member_name,
          toMemberId: tyfcb.to_member_id,
          toMemberName: tyfcb.to_member_name,
          amount: Number(tyfcb.amount),
          description: tyfcb.description,
          date: new Date(tyfcb.date),
          createdAt: new Date(tyfcb.created_at),
        }));
        
        setTYFCBs(transformedTYFCBs);
        return transformedTYFCBs;
      }
      return null;
    } catch (error) {
      console.error('Error fetching TYFCBs:', error);
      return null;
    }
  };

  // Reset mounted ref on cleanup
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  // Reset fetch attempt count and error state
  const resetFetchState = useCallback(() => {
    fetchAttemptRef.current = 0;
    setLoadError(null);
    lastFetchTimeRef.current = 0;
  }, []);

  const addReferral = async (referral: Partial<Referral>) => {
    try {
      console.log('Adding referral:', referral);
      // Implementation would go here
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding referral:', error);
      return Promise.reject(error);
    }
  };

  const addOneToOne = async (oneToOne: Partial<OneToOne>) => {
    try {
      console.log('Adding one-to-one:', oneToOne);
      // Implementation would go here
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding one-to-one:', error);
      return Promise.reject(error);
    }
  };

  const addTYFCB = async (tyfcb: Partial<TYFCB>) => {
    try {
      console.log('Adding TYFCB:', tyfcb);
      // Implementation would go here
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding TYFCB:', error);
      return Promise.reject(error);
    }
  };

  return {
    activities,
    referrals,
    oneToOnes,
    tyfcbs,
    isLoading,
    loadError,
    addReferral,
    addOneToOne,
    addTYFCB,
    fetchActivities,
    resetFetchState,
    cleanup
  };
};
