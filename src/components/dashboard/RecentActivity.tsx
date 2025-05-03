
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Activity } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const RecentActivity: React.FC = () => {
  const { activities, getUser, isLoading, loadError } = useData();
  
  // Check if we're loading or if we have activities
  const showLoading = isLoading && activities.length === 0;
  
  // Get the 5 most recent activities
  const recentActivities = [...activities].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  ).slice(0, 5);

  console.log('RecentActivity: Rendering with activities count:', activities.length);
  console.log('RecentActivity: Loading state:', isLoading);
  console.log('RecentActivity: Recent activities:', recentActivities);

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
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest network activity across the group</CardDescription>
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
