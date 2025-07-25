import { useState, useCallback, useEffect } from 'react';
import { Activity, Referral, OneToOne, TYFCB } from '@/types';
import { demoActivities, demoReferrals, demoOneToOnes, demoTYFCBs } from '@/data/demoData';
import { toast } from 'sonner';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [oneToOnes, setOneToOnes] = useState<OneToOne[]>([]);
  const [tyfcbs, setTyfcbs] = useState<TYFCB[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setActivities(demoActivities);
      setReferrals(demoReferrals);
      setOneToOnes(demoOneToOnes);
      setTyfcbs(demoTYFCBs);
      
      console.log(`Successfully loaded demo activities: ${demoActivities.length} activities, ${demoReferrals.length} referrals, ${demoOneToOnes.length} one-to-ones, ${demoTYFCBs.length} TYFCBs`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLoadError(errorMsg);
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addReferral = async (referralData: Partial<Referral>) => {
    const newReferral: Referral = {
      id: Date.now().toString(),
      fromMemberId: referralData.fromMemberId || '',
      fromMemberName: referralData.fromMemberName || '',
      toMemberId: referralData.toMemberId || '',
      toMemberName: referralData.toMemberName || '',
      description: referralData.description || '',
      date: referralData.date || new Date(),
      createdAt: new Date(),
      ...referralData,
    };
    
    setReferrals(prev => [...prev, newReferral]);
    toast.success('Referral added successfully');
    return newReferral;
  };

  const addOneToOne = async (oneToOneData: Partial<OneToOne>) => {
    const newOneToOne: OneToOne = {
      id: Date.now().toString(),
      member1Id: oneToOneData.member1Id || '',
      member1Name: oneToOneData.member1Name || '',
      member2Id: oneToOneData.member2Id || '',
      member2Name: oneToOneData.member2Name || '',
      date: oneToOneData.date || new Date(),
      notes: oneToOneData.notes || '',
      createdAt: new Date(),
      ...oneToOneData,
    };
    
    setOneToOnes(prev => [...prev, newOneToOne]);
    toast.success('One-to-one meeting added successfully');
    return newOneToOne;
  };

  const addTYFCB = async (tyfcbData: Partial<TYFCB>) => {
    const newTYFCB: TYFCB = {
      id: Date.now().toString(),
      fromMemberId: tyfcbData.fromMemberId || '',
      fromMemberName: tyfcbData.fromMemberName || '',
      toMemberId: tyfcbData.toMemberId || '',
      toMemberName: tyfcbData.toMemberName || '',
      amount: tyfcbData.amount || 0,
      description: tyfcbData.description || '',
      date: tyfcbData.date || new Date(),
      createdAt: new Date(),
      ...tyfcbData,
    };
    
    setTyfcbs(prev => [...prev, newTYFCB]);
    toast.success('TYFCB added successfully');
    return newTYFCB;
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
    resetFetchState: () => setLoadError(null)
  };
};