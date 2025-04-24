
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Referral, OneToOne, TYFCB } from '@/types';

interface RecentActivitiesProps {
  currentUserId: string;
  referrals: Referral[];
  oneToOnes: OneToOne[];
  closedBusiness: TYFCB[];
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  currentUserId,
  referrals,
  oneToOnes,
  closedBusiness,
}) => {
  return (
    <div>
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Recent Referrals</h4>
        {referrals && referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map(referral => (
              <div key={referral.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {referral.fromMemberId === currentUserId ? 
                        `You gave a referral to ${referral.toMemberName}` : 
                        `${referral.fromMemberName} gave you a referral`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(referral.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Referral
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent referrals to show.</p>
        )}
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Recent One-to-Ones</h4>
        {oneToOnes && oneToOnes.length > 0 ? (
          <div className="space-y-3">
            {oneToOnes.map(oneToOne => (
              <div key={oneToOne.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {`One-to-one with ${oneToOne.member1Id === currentUserId ? 
                        oneToOne.member2Name : 
                        oneToOne.member1Name}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(oneToOne.date), "MMMM d, yyyy")}
                    </p>
                    {oneToOne.notes && (
                      <p className="text-sm mt-1">{oneToOne.notes}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    One-to-One
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent one-to-ones to show.</p>
        )}
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Recent Closed Business</h4>
        {closedBusiness && closedBusiness.length > 0 ? (
          <div className="space-y-3">
            {closedBusiness.map(tyfcb => (
              <div key={tyfcb.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {tyfcb.fromMemberId === currentUserId ? 
                        `You thanked ${tyfcb.toMemberName} for closed business` : 
                        `${tyfcb.fromMemberName} thanked you for closed business`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(tyfcb.date), "MMMM d, yyyy")}
                    </p>
                    <p className="font-medium text-green-600 mt-1">
                      Amount: ${Number(tyfcb.amount).toLocaleString()}
                    </p>
                    {tyfcb.description && (
                      <p className="text-sm mt-1">{tyfcb.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    Closed Business
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent closed business to show.</p>
        )}
      </div>
    </div>
  );
};
