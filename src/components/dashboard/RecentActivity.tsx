
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Activity } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export const RecentActivity: React.FC = () => {
  const { activities, getUser, isLoading, loadError, fetchActivities } = useData();
  const [refreshing, setRefreshing] = useState(false);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchActivities();
    } catch (error) {
      console.error("Error refreshing activities:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Check if we're loading or if we have activities
  const showLoading = isLoading && activities.length === 0;
  
  // Get the 5 most recent activities
  const recentActivities = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  console.log('RecentActivity: Rendering with activities count:', activities.length);
  console.log('RecentActivity: Loading state:', isLoading);
  
  if (recentActivities.length > 0) {
    console.log('RecentActivity: First recent activity:', {
      id: recentActivities[0].id,
      type: recentActivities[0].type,
      description: recentActivities[0].description,
      date: recentActivities[0].date,
      userId: recentActivities[0].userId,
    });
  } else {
    console.log('RecentActivity: No recent activities found');
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'referral':
        return <span className="text-green-500">↗</span>;
      case 'visitor':
        return <span className="text-blue-500">👤</span>;
      case 'oneToOne':
        return <span className="text-orange-500">🤝</span>;
      case 'tyfcb':
        return <span className="text-purple-500">💰</span>;
      case 'event':
        return <span className="text-teal-500">📅</span>;
      case 'poll':
        return <span className="text-pink-500">📊</span>;
      default:
        return <span className="text-gray-500">•</span>;
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest network activity across the group</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing || isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing || isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {showLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-start space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Failed to load activities</p>
                <p className="text-xs text-red-700">Please try again later</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const user = getUser(activity.userId);
                
                return (
                  <div key={activity.id} className="flex items-start">
                    <div className="mr-2 mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity to display.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
