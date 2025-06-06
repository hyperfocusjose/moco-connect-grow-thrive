
import React, { useEffect, useState } from 'react';
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
import { ArrowUpRight, Users, Calendar, ListCheck, Star, Clock, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isAfter, startOfToday, addWeeks } from 'date-fns';
import { toast } from 'sonner';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const {
    getUserMetrics,
    visitors,
    fetchUsers,
    fetchActivities,
    fetchEvents,
    fetchVisitors,
    reloadData,
    isLoading
  } = useData();

  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Function to manually reload all data
  const handleRefreshData = async () => {
    setRefreshing(true);
    toast.info("Refreshing data...");
    try {
      await reloadData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh some data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("Dashboard: Initial data load starting");
        await reloadData();
        console.log("Dashboard: Initial data load completed");
        setDataInitialized(true);
      } catch (error) {
        console.error('Dashboard load error:', error);
      }
    };
    loadDashboardData();
  }, [reloadData]);

  const metrics = currentUser ? getUserMetrics(currentUser.id) : null;

  const referralIcon = <ArrowUpRight className="h-4 w-4 text-white" />;
  const visitorIcon = <Users className="h-4 w-4 text-white" />;
  const oneToOneIcon = <ListCheck className="h-4 w-4 text-white" />;
  const tyfcbIcon = <Calendar className="h-4 w-4 text-white" />;

  const today = startOfToday();
  const fourWeeksLater = addWeeks(today, 4);

  const upcomingVisitors = visitors
    ? visitors.filter(visitor => {
        const visitDate = new Date(visitor.visitDate);
        return isAfter(visitDate, today) && visitDate <= fourWeeksLater;
      }).sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
    : [];

  const handleVisitorFormComplete = () => {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleRefreshData} 
            variant="outline" 
            size="sm"
            disabled={refreshing || isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(refreshing || isLoading) ? 'animate-spin' : ''}`} />
            {refreshing || isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <div className="text-sm text-muted-foreground">
            Welcome back, {currentUser?.firstName}!
          </div>
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
          formComponent={<VisitorForm onComplete={handleVisitorFormComplete} />}
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

      {/* Activity + Events + Visitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <UpcomingEvents />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-maroon" />
                Upcoming Visitors
              </CardTitle>
              <CardDescription>People visiting our meetings in the next 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-maroon"></div>
                </div>
              ) : upcomingVisitors.length > 0 ? (
                <div className="space-y-4">
                  {upcomingVisitors.map(visitor => (
                    <div key={visitor.id} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{visitor.visitorName}</p>
                          <p className="text-sm text-muted-foreground">{visitor.visitorBusiness}</p>
                        </div>
                        {visitor.isSelfEntered && (
                          <Badge variant="outline" className="h-6 bg-amber-50 text-amber-800 border-amber-300">
                            <Star className="mr-1 h-3 w-3" /> Self-Registered
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 text-xs flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>Visiting on {format(new Date(visitor.visitDate), 'EEEE, MMMM d')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No upcoming visitors scheduled.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
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
