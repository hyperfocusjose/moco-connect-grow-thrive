
import { useCallback } from 'react';
import { User, Referral, Visitor, OneToOne, TYFCB } from '@/types';

interface UseMetricsProps {
  users: User[];
  referrals: Referral[];
  visitors: Visitor[];
  oneToOnes: OneToOne[];
  tyfcbs: TYFCB[];
}

export const useMetrics = ({ 
  users, 
  referrals, 
  visitors, 
  oneToOnes, 
  tyfcbs 
}: UseMetricsProps) => {
  const stats = {};

  const getUserMetrics = useCallback((userId: string) => {
    const userReferrals = referrals.filter(r => r.fromMemberId === userId);
    const userVisitors = visitors.filter(v => v.hostMemberId === userId && !v.didNotShow);
    const userOneToOnes = oneToOnes.filter(
      o => o.member1Id === userId || o.member2Id === userId
    );
    const userTYFCB = tyfcbs.filter(t => t.fromMemberId === userId);
    
    const totalTYFCBAmount = userTYFCB.reduce((sum, curr) => sum + Number(curr.amount || 0), 0);
    
    return {
      referrals: userReferrals.length,
      visitors: userVisitors.length,
      oneToOnes: userOneToOnes.length,
      tyfcb: {
        amount: totalTYFCBAmount,
        count: userTYFCB.length
      }
    };
  }, [referrals, visitors, oneToOnes, tyfcbs]);

  const getTopPerformers = useCallback(() => {
    const memberPerformance = users.map(user => {
      const metrics = getUserMetrics(user.id);
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        referrals: metrics.referrals,
        visitors: metrics.visitors,
        oneToOnes: metrics.oneToOnes,
        tyfcb: metrics.tyfcb,
      };
    });

    const sortedByReferrals = [...memberPerformance].sort((a, b) => b.referrals - a.referrals);
    const sortedByVisitors = [...memberPerformance].sort((a, b) => b.visitors - a.visitors);
    const sortedByOneToOnes = [...memberPerformance].sort((a, b) => b.oneToOnes - a.oneToOnes);
    const sortedByTYFCB = [...memberPerformance].sort((a, b) => b.tyfcb.amount - a.tyfcb.amount);

    return {
      referrals: sortedByReferrals.slice(0, 5),
      visitors: sortedByVisitors.slice(0, 5),
      oneToOnes: sortedByOneToOnes.slice(0, 5),
      tyfcb: sortedByTYFCB.slice(0, 5),
    };
  }, [users, getUserMetrics]);

  const getActivityForAllMembers = useCallback(() => {
    return users.map(user => {
      const metrics = getUserMetrics(user.id);
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        metrics,
      };
    });
  }, [users, getUserMetrics]);

  return {
    stats,
    getUserMetrics,
    getTopPerformers,
    getActivityForAllMembers
  };
};
