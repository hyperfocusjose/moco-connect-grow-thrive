import { useState, useCallback, useEffect, useRef } from 'react';
import { Activity, Referral, OneToOne, TYFCB } from '@/types';
import { supabase } from '@/integrations/supabase/client';
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

  // Fetch all activities from the database
  const fetchActivities = useCallback(async (): Promise<void> => {
    // Prevent fetching if already loading
    if (isLoading) return;
    
    // Implement cooldown to prevent rapid refetching
    const now = Date.now();
    const cooldownPeriod = 5000; // 5 seconds cooldown
    if (now - lastFetchTimeRef.current < cooldownPeriod) {
      console.log('Activities fetch cooldown active, skipping request');
      return;
    }
    
    // Track fetch attempts and implement exponential backoff
    fetchAttemptRef.current += 1;
    const maxRetries = 3;
    if (fetchAttemptRef.current > maxRetries) {
      if (fetchAttemptRef.current === maxRetries + 1) {
        setLoadError('Too many failed attempts to load activities. Please try again later.');
        toast.error('Activities could not be loaded', { 
          description: 'Check your network connection and try again later.',
          id: 'activities-load-error' 
        });
      }
      console.warn(`Activities fetch exceeded ${maxRetries} attempts, stopping`);
      return;
    }

    // Only show loading state on first attempt 
    if (fetchAttemptRef.current === 1) {
      setIsLoading(true);
    }
    
    lastFetchTimeRef.current = now;

    try {
      console.log('Fetching activities from Supabase...');
      
      // Fetch referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*');

      // Always check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        setLoadError(referralsError.message);
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load referrals');
        }
      } else {
        console.log('Referrals data:', referralsData);
        const formattedReferrals = referralsData?.map(referral => ({
          id: referral.id,
          fromMemberId: referral.from_member_id || '',
          fromMemberName: referral.from_member_name || '',
          toMemberId: referral.to_member_id || '',
          toMemberName: referral.to_member_name || '',
          description: referral.description || '',
          date: new Date(referral.date),
          createdAt: new Date(referral.created_at),
        })) || [];
        console.log('Formatted referrals:', formattedReferrals.length);
        setReferrals(formattedReferrals);
      }

      // Fetch one-to-ones
      const { data: oneToOneData, error: oneToOneError } = await supabase
        .from('one_to_ones')
        .select('*');

      // Always check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (oneToOneError) {
        console.error('Error fetching one-to-ones:', oneToOneError);
        setLoadError(oneToOneError.message);
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load one-to-ones');
        }
      } else {
        const formattedOneToOnes = oneToOneData?.map(oneToOne => ({
          id: oneToOne.id,
          member1Id: oneToOne.member1_id || '',
          member1Name: oneToOne.member1_name || '',
          member2Id: oneToOne.member2_id || '',
          member2Name: oneToOne.member2_name || '',
          date: new Date(oneToOne.date),
          notes: oneToOne.notes || '',
          createdAt: new Date(oneToOne.created_at),
        })) || [];
        setOneToOnes(formattedOneToOnes);
      }

      // Fetch TYFCBs
      const { data: tyfcbData, error: tyfcbError } = await supabase
        .from('tyfcb')
        .select('*');

      // Always check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (tyfcbError) {
        console.error('Error fetching TYFCBs:', tyfcbError);
        setLoadError(tyfcbError.message);
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load TYFCBs');
        }
      } else {
        const formattedTYFCBs = tyfcbData?.map(tyfcb => ({
          id: tyfcb.id,
          fromMemberId: tyfcb.from_member_id || '',
          fromMemberName: tyfcb.from_member_name || '',
          toMemberId: tyfcb.to_member_id || '',
          toMemberName: tyfcb.to_member_name || '',
          amount: Number(tyfcb.amount),
          description: tyfcb.description || '',
          date: new Date(tyfcb.date),
          createdAt: new Date(tyfcb.created_at),
        })) || [];
        setTYFCBs(formattedTYFCBs);
      }

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*');

      // Always check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        setLoadError(activitiesError.message);
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load activities');
        }
      } else {
        console.log('Activities data:', activitiesData);
        const formattedActivities = activitiesData?.map(activity => ({
          id: activity.id,
          type: activity.type as Activity['type'],
          description: activity.description || '',
          date: new Date(activity.date),
          userId: activity.user_id || '',
          relatedUserId: activity.related_user_id || undefined,
          referenceId: activity.reference_id || '',
        })) || [];
        console.log('Formatted activities:', formattedActivities.length);
        setActivities(formattedActivities);
      }

      // Reset error state and fetch attempts on success if there were no errors
      if (!referralsError && !activitiesError) {
        setLoadError(null);
        fetchAttemptRef.current = 0;
      }
    } catch (error) {
      console.error('Error in fetchActivities:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      
      // Only show toast on first error
      if (fetchAttemptRef.current === 1) {
        toast.error('Failed to load activities');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  // Add auto-fetching on mount
  useEffect(() => {
    console.log('Activities hook mounted, fetching activities...');
    fetchActivities();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchActivities]);

  // Reset mounted ref on cleanup to prevent memory leaks
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  // Reset fetch attempt count and error state
  const resetFetchState = useCallback(() => {
    fetchAttemptRef.current = 0;
    setLoadError(null);
    lastFetchTimeRef.current = 0;
  }, []);

  // Add referral
  const addReferral = async (referral: Partial<Referral>) => {
    try {
      if (!referral.fromMemberId || !referral.toMemberId || !referral.description || !referral.date) {
        toast.error('Please fill in all required fields for the referral.');
        return;
      }

      const newReferral: Referral = {
        id: crypto.randomUUID(),
        fromMemberId: referral.fromMemberId,
        fromMemberName: referral.fromMemberName || '',
        toMemberId: referral.toMemberId,
        toMemberName: referral.toMemberName || '',
        description: referral.description,
        date: new Date(referral.date),
        createdAt: new Date(),
      };

      const { error } = await supabase
        .from('referrals')
        .insert({
          id: newReferral.id,
          from_member_id: newReferral.fromMemberId,
          from_member_name: newReferral.fromMemberName,
          to_member_id: newReferral.toMemberId,
          to_member_name: newReferral.toMemberName,
          description: newReferral.description,
          date: newReferral.date.toISOString(),
          created_at: newReferral.createdAt.toISOString(),
        });

      if (error) {
        console.error('Error adding referral:', error);
        toast.error('Failed to add referral');
        return;
      }

      setReferrals(prev => [...prev, newReferral]);
      toast.success('Referral added successfully');
    } catch (error) {
      console.error('Error in addReferral:', error);
      toast.error('Failed to add referral');
    }
  };

  // Add one-to-one meeting
  const addOneToOne = async (oneToOne: Partial<OneToOne>) => {
    try {
      if (!oneToOne.member1Id || !oneToOne.member2Id || !oneToOne.date) {
        toast.error('Please fill in all required fields for the one-to-one meeting.');
        return;
      }

      const newOneToOne: OneToOne = {
        id: crypto.randomUUID(),
        member1Id: oneToOne.member1Id,
        member1Name: oneToOne.member1Name || '',
        member2Id: oneToOne.member2Id,
        member2Name: oneToOne.member2Name || '',
        date: new Date(oneToOne.date),
        notes: oneToOne.notes || '',
        createdAt: new Date(),
      };

      const { error } = await supabase
        .from('one_to_ones')
        .insert({
          id: newOneToOne.id,
          member1_id: newOneToOne.member1Id,
          member1_name: newOneToOne.member1Name,
          member2_id: newOneToOne.member2Id,
          member2_name: newOneToOne.member2Name,
          date: newOneToOne.date.toISOString(),
          notes: newOneToOne.notes,
          created_at: newOneToOne.createdAt.toISOString(),
        });

      if (error) {
        console.error('Error adding one-to-one:', error);
        toast.error('Failed to add one-to-one meeting');
        return;
      }

      setOneToOnes(prev => [...prev, newOneToOne]);
      toast.success('One-to-one meeting added successfully');
    } catch (error) {
      console.error('Error in addOneToOne:', error);
      toast.error('Failed to add one-to-one meeting');
    }
  };

  // Add TYFCB
  const addTYFCB = async (tyfcb: Partial<TYFCB>) => {
    try {
      if (!tyfcb.fromMemberId || !tyfcb.toMemberId || !tyfcb.amount || !tyfcb.date) {
        toast.error('Please fill in all required fields for the TYFCB.');
        return;
      }

      const newTYFCB: TYFCB = {
        id: crypto.randomUUID(),
        fromMemberId: tyfcb.fromMemberId,
        fromMemberName: tyfcb.fromMemberName || '',
        toMemberId: tyfcb.toMemberId,
        toMemberName: tyfcb.toMemberName || '',
        amount: Number(tyfcb.amount),
        description: tyfcb.description || '',
        date: new Date(tyfcb.date),
        createdAt: new Date(),
      };

      const { error } = await supabase
        .from('tyfcb')
        .insert({
          id: newTYFCB.id,
          from_member_id: newTYFCB.fromMemberId,
          from_member_name: newTYFCB.fromMemberName,
          to_member_id: newTYFCB.toMemberId,
          to_member_name: newTYFCB.toMemberName,
          amount: newTYFCB.amount,
          description: newTYFCB.description,
          date: newTYFCB.date.toISOString(),
          created_at: newTYFCB.createdAt.toISOString(),
        });

      if (error) {
        console.error('Error adding TYFCB:', error);
        toast.error('Failed to add TYFCB');
        return;
      }

      setTYFCBs(prev => [...prev, newTYFCB]);
      toast.success('TYFCB added successfully');
    } catch (error) {
      console.error('Error in addTYFCB:', error);
      toast.error('Failed to add TYFCB');
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
