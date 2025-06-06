
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
  const isMountedRef = useRef(true);

  const fetchActivities = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadError(null);
    console.log('fetchActivities: Starting to fetch activities data');

    try {
      // First check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.warn('No active session found when fetching activities, data may be incomplete');
      }
      
      // Fetch all data simultaneously
      const [
        { data: referralsData, error: referralsError },
        { data: oneToOneData, error: oneToOneError },
        { data: tyfcbData, error: tyfcbError },
        { data: activitiesData, error: activitiesError }
      ] = await Promise.all([
        supabase.from('referrals').select('*'),
        supabase.from('one_to_ones').select('*'),
        supabase.from('tyfcb').select('*'),
        supabase.from('activities').select('*')
      ]);

      if (!isMountedRef.current) return;

      if (referralsError || oneToOneError || tyfcbError || activitiesError) {
        const errors = [referralsError, oneToOneError, tyfcbError, activitiesError].filter(Boolean);
        console.error('Error(s) fetching activity data:', errors);
        setLoadError(errors[0]?.message || 'Unknown error');
        toast.error('Failed to load activity data');
        return;
      }

      console.log('fetchActivities: Fetched data counts -', 
        'referrals:', referralsData?.length || 0,
        'oneToOnes:', oneToOneData?.length || 0,
        'tyfcbs:', tyfcbData?.length || 0,
        'activities:', activitiesData?.length || 0
      );

      const formattedReferrals: Referral[] = referralsData?.map(referral => ({
        id: referral.id,
        fromMemberId: referral.from_member_id || '',
        fromMemberName: referral.from_member_name || '',
        toMemberId: referral.to_member_id || '',
        toMemberName: referral.to_member_name || '',
        description: referral.description || '',
        date: new Date(referral.date),
        createdAt: new Date(referral.created_at),
      })) || [];

      const formattedOneToOnes: OneToOne[] = oneToOneData?.map(oneToOne => ({
        id: oneToOne.id,
        member1Id: oneToOne.member1_id || '',
        member1Name: oneToOne.member1_name || '',
        member2Id: oneToOne.member2_id || '',
        member2Name: oneToOne.member2_name || '',
        date: new Date(oneToOne.date),
        notes: oneToOne.notes || '',
        createdAt: new Date(oneToOne.created_at),
      })) || [];

      const formattedTYFCBs: TYFCB[] = tyfcbData?.map(tyfcb => ({
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

      // Fix: Validate and cast activity type to ensure it matches the union type in the Activity interface
      const formattedActivities: Activity[] = (activitiesData || []).map(activity => {
        // Ensure the type is one of the valid types defined in the Activity interface
        const validType = validateActivityType(activity.type);
        
        return {
          id: activity.id,
          type: validType,
          description: activity.description || '',
          date: new Date(activity.date),
          userId: activity.user_id || '',
          relatedUserId: activity.related_user_id || undefined,
          referenceId: activity.reference_id || '',
        };
      });

      setReferrals(formattedReferrals);
      setOneToOnes(formattedOneToOnes);
      setTYFCBs(formattedTYFCBs);
      setActivities(formattedActivities);

      setLoadError(null);
    } catch (error) {
      console.error('Error in fetchActivities:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load activities');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      console.log('fetchActivities: Completed');
    }
  }, [isLoading]);

  // Helper function to validate activity type
  const validateActivityType = (type: string): Activity['type'] => {
    const validTypes: Activity['type'][] = ['referral', 'visitor', 'oneToOne', 'tyfcb', 'event', 'poll'];
    
    if (validTypes.includes(type as Activity['type'])) {
      return type as Activity['type'];
    }
    
    // Default to 'referral' if the type is not valid
    console.warn(`Invalid activity type: ${type}, defaulting to 'referral'`);
    return 'referral';
  };

  useEffect(() => {
    console.log('useActivities: Initial mount, fetching activities');
    fetchActivities();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchActivities]);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  const resetFetchState = useCallback(() => {
    setLoadError(null);
  }, []);

  // Helper function to create activity record
  const createActivityRecord = async (
    type: Activity['type'],
    description: string,
    userId: string,
    referenceId: string,
    relatedUserId?: string
  ) => {
    try {
      const newActivity = {
        type,
        description,
        date: new Date().toISOString(), // Convert Date to ISO string for Supabase
        user_id: userId,
        reference_id: referenceId,
        related_user_id: relatedUserId
      };

      console.log('Creating activity record:', newActivity);
      
      const { data, error } = await supabase.from('activities').insert(newActivity).select();
      
      if (error) {
        console.error('Error creating activity record:', error);
        return false;
      }
      
      // If successful, update local state
      if (data && data.length > 0) {
        const formattedActivity: Activity = {
          id: data[0].id,
          type,
          description,
          date: new Date(data[0].date),
          userId,
          relatedUserId,
          referenceId
        };
        
        setActivities(prev => [...prev, formattedActivity]);
      }
      
      return true;
    } catch (error) {
      console.error('Error in createActivityRecord:', error);
      return false;
    }
  };

  const addReferral = async (referral: Partial<Referral>) => {
    try {
      console.log('Adding referral:', referral);
      
      // First check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const error = 'No active session found. Please log in again.';
        console.error(error);
        toast.error(error);
        throw new Error(error);
      }
      
      if (!referral.fromMemberId || !referral.toMemberId || !referral.description || !referral.date) {
        const error = 'Please fill in all required fields for the referral.';
        toast.error(error);
        throw new Error(error);
      }

      const newReferral: Referral = {
        id: referral.id || crypto.randomUUID(),
        fromMemberId: referral.fromMemberId,
        fromMemberName: referral.fromMemberName || '',
        toMemberId: referral.toMemberId,
        toMemberName: referral.toMemberName || '',
        description: referral.description,
        date: new Date(referral.date),
        createdAt: new Date(),
      };

      // Convert newReferral to the format expected by Supabase
      const referralForDb = {
        id: newReferral.id,
        from_member_id: newReferral.fromMemberId,
        from_member_name: newReferral.fromMemberName,
        to_member_id: newReferral.toMemberId,
        to_member_name: newReferral.toMemberName,
        description: newReferral.description,
        date: newReferral.date.toISOString(),
        created_at: newReferral.createdAt.toISOString(),
      };

      console.log('Inserting referral into Supabase:', referralForDb);
      
      const { error } = await supabase.from('referrals').insert(referralForDb);

      if (error) {
        console.error('Error inserting referral:', error);
        toast.error(`Failed to add referral: ${error.message}`);
        throw error;
      }

      // Update local state
      setReferrals(prev => [...prev, newReferral]);
      
      // Create activity record for this referral
      await createActivityRecord(
        'referral',
        `Made a referral to ${newReferral.toMemberName}`,
        newReferral.fromMemberId,
        newReferral.id,
        newReferral.toMemberId
      );
      
      toast.success('Referral added successfully');
      return newReferral;
    } catch (error) {
      console.error('Error in addReferral:', error);
      throw error;
    }
  };

  // Similar updates to addOneToOne and addTYFCB - update date format and improve error handling
  const addOneToOne = async (oneToOne: Partial<OneToOne>) => {
    try {
      console.log('Adding one-to-one:', oneToOne);
      
      // First check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const error = 'No active session found. Please log in again.';
        console.error(error);
        toast.error(error);
        throw new Error(error);
      }

      if (!oneToOne.member1Id || !oneToOne.member2Id || !oneToOne.date) {
        const error = 'Please fill in all required fields for the one-to-one meeting.';
        toast.error(error);
        throw new Error(error);
      }

      const newOneToOne: OneToOne = {
        id: oneToOne.id || crypto.randomUUID(),
        member1Id: oneToOne.member1Id,
        member1Name: oneToOne.member1Name || '',
        member2Id: oneToOne.member2Id,
        member2Name: oneToOne.member2Name || '',
        date: new Date(oneToOne.date),
        notes: oneToOne.notes || '',
        createdAt: new Date(),
      };

      // Convert newOneToOne to the format expected by Supabase
      const oneToOneForDb = {
        id: newOneToOne.id,
        member1_id: newOneToOne.member1Id,
        member1_name: newOneToOne.member1Name,
        member2_id: newOneToOne.member2Id,
        member2_name: newOneToOne.member2Name,
        date: newOneToOne.date.toISOString(),
        notes: newOneToOne.notes,
        created_at: newOneToOne.createdAt.toISOString(),
      };

      console.log('Inserting one-to-one into Supabase:', oneToOneForDb);
      
      const { error } = await supabase.from('one_to_ones').insert(oneToOneForDb);

      if (error) {
        console.error('Error inserting one-to-one:', error);
        toast.error(`Failed to add one-to-one meeting: ${error.message}`);
        throw error;
      }

      // Update local state
      setOneToOnes(prev => [...prev, newOneToOne]);
      
      // Create activity record for this one-to-one
      await createActivityRecord(
        'oneToOne',
        `Had a one-to-one meeting with ${newOneToOne.member2Name}`,
        newOneToOne.member1Id,
        newOneToOne.id,
        newOneToOne.member2Id
      );
      
      toast.success('One-to-one meeting added successfully');
      return newOneToOne;
    } catch (error) {
      console.error('Error in addOneToOne:', error);
      throw error;
    }
  };

  const addTYFCB = async (tyfcb: Partial<TYFCB>) => {
    try {
      console.log('Adding TYFCB:', tyfcb);
      
      // First check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const error = 'No active session found. Please log in again.';
        console.error(error);
        toast.error(error);
        throw new Error(error);
      }
      
      if (!tyfcb.fromMemberId || !tyfcb.toMemberId || !tyfcb.amount || !tyfcb.date) {
        const error = 'Please fill in all required fields for the TYFCB.';
        toast.error(error);
        throw new Error(error);
      }

      const newTYFCB: TYFCB = {
        id: tyfcb.id || crypto.randomUUID(),
        fromMemberId: tyfcb.fromMemberId,
        fromMemberName: tyfcb.fromMemberName || '',
        toMemberId: tyfcb.toMemberId,
        toMemberName: tyfcb.toMemberName || '',
        amount: Number(tyfcb.amount),
        description: tyfcb.description || '',
        date: new Date(tyfcb.date),
        createdAt: new Date(),
      };

      // Convert newTYFCB to the format expected by Supabase
      const tyfcbForDb = {
        id: newTYFCB.id,
        from_member_id: newTYFCB.fromMemberId,
        from_member_name: newTYFCB.fromMemberName,
        to_member_id: newTYFCB.toMemberId,
        to_member_name: newTYFCB.toMemberName,
        amount: newTYFCB.amount,
        description: newTYFCB.description,
        date: newTYFCB.date.toISOString(),
        created_at: newTYFCB.createdAt.toISOString(),
      };

      console.log('Inserting TYFCB into Supabase:', tyfcbForDb);
      
      const { error } = await supabase.from('tyfcb').insert(tyfcbForDb);

      if (error) {
        console.error('Error inserting TYFCB:', error);
        toast.error(`Failed to add TYFCB: ${error.message}`);
        throw error;
      }

      // Update local state
      setTYFCBs(prev => [...prev, newTYFCB]);
      
      // Create activity record for this TYFCB
      await createActivityRecord(
        'tyfcb',
        `Recorded closed business with ${newTYFCB.toMemberName} for $${newTYFCB.amount}`,
        newTYFCB.fromMemberId,
        newTYFCB.id,
        newTYFCB.toMemberId
      );
      
      toast.success('TYFCB added successfully');
      return newTYFCB;
    } catch (error) {
      console.error('Error in addTYFCB:', error);
      throw error;
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
