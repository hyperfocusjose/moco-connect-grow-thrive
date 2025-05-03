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

  const fetchActivities = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    const now = Date.now();
    const cooldownPeriod = 5000;
    if (now - lastFetchTimeRef.current < cooldownPeriod) {
      console.log('Activities fetch cooldown active, skipping request');
      return;
    }

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

    if (fetchAttemptRef.current === 1) setIsLoading(true);
    lastFetchTimeRef.current = now;

    try {
      console.log('Fetching activities from Supabase...');

      const [referralsRes, oneToOnesRes, tyfcbsRes, activitiesRes] = await Promise.all([
        supabase.from('referrals').select('*'),
        supabase.from('one_to_ones').select('*'),
        supabase.from('tyfcb').select('*'),
        supabase.from('activities').select('*')
      ]);

      const hasError = [referralsRes.error, oneToOnesRes.error, tyfcbsRes.error, activitiesRes.error].some(Boolean);
      if (hasError) {
        const errors = [
          referralsRes.error?.message,
          oneToOnesRes.error?.message,
          tyfcbsRes.error?.message,
          activitiesRes.error?.message
        ].filter(Boolean).join(' | ');
        throw new Error(errors || 'Unknown error occurred while fetching activities');
      }

      if (isMountedRef.current) {
        setReferrals(referralsRes.data?.map(ref => ({
          id: ref.id,
          fromMemberId: ref.from_member_id || '',
          fromMemberName: ref.from_member_name || '',
          toMemberId: ref.to_member_id || '',
          toMemberName: ref.to_member_name || '',
          description: ref.description || '',
          date: new Date(ref.date),
          createdAt: new Date(ref.created_at),
        })) || []);

        setOneToOnes(oneToOnesRes.data?.map(one => ({
          id: one.id,
          member1Id: one.member1_id || '',
          member1Name: one.member1_name || '',
          member2Id: one.member2_id || '',
          member2Name: one.member2_name || '',
          date: new Date(one.date),
          notes: one.notes || '',
          createdAt: new Date(one.created_at),
        })) || []);

        setTYFCBs(tyfcbsRes.data?.map(t => ({
          id: t.id,
          fromMemberId: t.from_member_id || '',
          fromMemberName: t.from_member_name || '',
          toMemberId: t.to_member_id || '',
          toMemberName: t.to_member_name || '',
          amount: Number(t.amount),
          description: t.description || '',
          date: new Date(t.date),
          createdAt: new Date(t.created_at),
        })) || []);

        setActivities(activitiesRes.data?.map(a => ({
          id: a.id,
          type: a.type,
          description: a.description || '',
          date: new Date(a.date),
          userId: a.user_id || '',
          relatedUserId: a.related_user_id || undefined,
          referenceId: a.reference_id || '',
        })) || []);

        setLoadError(null);
        fetchAttemptRef.current = 0;
      }
    } catch (error) {
      console.error('Error in fetchActivities:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      if (fetchAttemptRef.current === 1) {
        toast.error('Failed to load activities');
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    console.log('Activities hook mounted, fetching activities...');
    fetchActivities();
    return () => { isMountedRef.current = false; };
  }, [fetchActivities]);

  const cleanup = useCallback(() => { isMountedRef.current = false; }, []);
  const resetFetchState = useCallback(() => {
    fetchAttemptRef.current = 0;
    setLoadError(null);
    lastFetchTimeRef.current = 0;
  }, []);

  // Existing addReferral, addOneToOne, addTYFCB can stay unchanged

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