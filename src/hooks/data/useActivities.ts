
import { useState } from 'react';
import { Activity, Referral, OneToOne, TYFCB } from '@/types';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [oneToOnes, setOneToOnes] = useState<OneToOne[]>([]);
  const [tyfcbs, setTYFCBs] = useState<TYFCB[]>([]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }
      
      if (data) {
        const transformedActivities: Activity[] = data.map(activity => ({
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
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    }
  };

  const addReferral = async (referral: Partial<Referral>) => {
    return Promise.resolve();
  };

  const addOneToOne = async (oneToOne: Partial<OneToOne>) => {
    return Promise.resolve();
  };

  const addTYFCB = async (tyfcb: Partial<TYFCB>) => {
    return Promise.resolve();
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
