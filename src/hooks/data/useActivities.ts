
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Referral, OneToOne, TYFCB } from '@/types';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [oneToOnes, setOneToOnes] = useState<OneToOne[]>([]);
  const [tyfcbs, setTYFCBs] = useState<TYFCB[]>([]);

  const fetchActivities = async () => {
    try {
      console.log('Fetching activities...');
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
        
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        return;
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

      // Fetch all referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('date', { ascending: false });
        
      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
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
      }

      // Fetch all one-to-ones
      const { data: oneToOnesData, error: oneToOnesError } = await supabase
        .from('one_to_ones')
        .select('*')
        .order('date', { ascending: false });
        
      if (oneToOnesError) {
        console.error('Error fetching one-to-ones:', oneToOnesError);
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
      }

      // Fetch all TYFCBs (Thank You For Closed Business)
      const { data: tyfcbsData, error: tyfcbsError } = await supabase
        .from('tyfcb')
        .select('*')
        .order('date', { ascending: false });
        
      if (tyfcbsError) {
        console.error('Error fetching TYFCBs:', tyfcbsError);
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
      }
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    }
  };

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
    addReferral,
    addOneToOne,
    addTYFCB,
    fetchActivities
  };
};
