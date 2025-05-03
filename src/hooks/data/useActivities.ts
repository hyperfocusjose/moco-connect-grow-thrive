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

      const formattedActivities: Activity[] = activitiesData?.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description || '',
        date: new Date(activity.date),
        userId: activity.user_id || '',
        relatedUserId: activity.related_user_id || undefined,
        referenceId: activity.reference_id || '',
      })) || [];

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

      const { error } = await supabase.from('referrals').insert({
        id: newReferral.id,
        from_member_id: newReferral.fromMemberId,
        from_member_name: newReferral.fromMemberName,
        to_member_id: newReferral.toMemberId,
        to_member_name: newReferral.toMemberName,
        description: newReferral.description,
        date: newReferral.date.toISOString(),
        created_at: newReferral.createdAt.toISOString(),
      });

      if (error) throw error;

      setReferrals(prev => [...prev, newReferral]);
      toast.success('Referral added successfully');
    } catch (error) {
      console.error('Error in addReferral:', error);
      toast.error('Failed to add referral');
    }
  };

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

      const { error } = await supabase.from('one_to_ones').insert({
        id: newOneToOne.id,
        member1_id: newOneToOne.member1Id,
        member1_name: newOneToOne.member1Name,
        member2_id: newOneToOne.member2Id,
        member2_name: newOneToOne.member2Name,
        date: newOneToOne.date.toISOString(),
        notes: newOneToOne.notes,
        created_at: newOneToOne.createdAt.toISOString(),
      });

      if (error) throw error;

      setOneToOnes(prev => [...prev, newOneToOne]);
      toast.success('One-to-one meeting added successfully');
    } catch (error) {
      console.error('Error in addOneToOne:', error);
      toast.error('Failed to add one-to-one meeting');
    }
  };

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

      const { error } = await supabase.from('tyfcb').insert({
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

      if (error) throw error;

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
