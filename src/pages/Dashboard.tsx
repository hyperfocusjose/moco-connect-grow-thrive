
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { ReferralForm } from '@/components/forms/ReferralForm';
import { VisitorForm } from '@/components/forms/VisitorForm';
import { OneToOneForm } from '@/components/forms/OneToOneForm';
import { TYFCBForm } from '@/components/forms/TYFCBForm';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Users, Calendar, ListCheck } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { getUserMetrics } = useData();
  const navigate = useNavigate();

  // If user is logged in, get their metrics
  const metrics = currentUser ? getUserMetrics(currentUser.id) : null;

  // Icons for metric cards
  const referralIcon = <ArrowUpRight className="h-4 w-4 text-white" />;
  const visitorIcon = <Users className="h-4 w-4 text-white" />;
  const oneToOneIcon = <ListCheck className="h-4 w-4 text-white" />;
  const tyfcbIcon = <Calendar className="h-4 w-4 text-white" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, {currentUser?.firstName}!
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Referrals"
          value={metrics?.referrals || 0}
          description="Total referrals made YTD"
          icon={referralIcon}
          iconColor="bg-green-600"
          formComponent={<ReferralForm />}
        />

        <MetricCard
          title="Visitors"
          value={metrics?.visitors || 0}
          description="Total visitors brought YTD"
          icon={visitorIcon}
          iconColor="bg-blue-600"
          formComponent={<VisitorForm />}
        />

        <MetricCard
          title="One-to-Ones"
          value={metrics?.oneToOnes || 0}
          description="Total one-to-one meetings YTD"
          icon={oneToOneIcon}
          iconColor="bg-orange-600"
          formComponent={<OneToOneForm />}
        />

        <MetricCard
          title="Closed Business"
          value={`$${(metrics?.tyfcb.amount || 0).toLocaleString()}`}
          description={`${metrics?.tyfcb.count || 0} thank you's YTD`}
          icon={tyfcbIcon}
          iconColor="bg-purple-600"
          formComponent={<TYFCBForm />}
        />
      </div>

      {/* Activity and Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivity />
        <UpcomingEvents />
      </div>

      {/* Quick Links */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-medium mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/directory')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-maroon mb-2" />
            <span className="text-sm font-medium">Member Directory</span>
          </button>
          <button
            onClick={() => navigate('/events')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-6 w-6 text-maroon mb-2" />
            <span className="text-sm font-medium">Events Calendar</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ListCheck className="h-6 w-6 text-maroon mb-2" />
            <span className="text-sm font-medium">Reports & Analytics</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowUpRight className="h-6 w-6 text-maroon mb-2" />
            <span className="text-sm font-medium">My Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
