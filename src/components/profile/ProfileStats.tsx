
import React from 'react';

interface ProfileStatsProps {
  referralsGiven: number;
  referralsReceived: number;
  oneToOnesDone: number;
  closedBusiness: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  referralsGiven,
  referralsReceived,
  oneToOnesDone,
  closedBusiness,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="font-semibold text-lg mb-4">My Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-500">Referrals Given</div>
          <div className="text-xl font-bold text-green-600">{referralsGiven}</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-500">Referrals Received</div>
          <div className="text-xl font-bold text-blue-600">{referralsReceived}</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg">
          <div className="text-sm text-gray-500">One-to-Ones</div>
          <div className="text-xl font-bold text-amber-600">{oneToOnesDone}</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-500">Closed Business</div>
          <div className="text-xl font-bold text-purple-600">${closedBusiness.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};
