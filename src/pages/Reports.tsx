
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell } from 'recharts';
import { Activity, Referral, Visitor, OneToOne, TYFCB } from '@/types';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

const Reports = () => {
  const { referrals, visitors, oneToOnes, tyfcbs, users, activities } = useData();
  const [timeFrame, setTimeFrame] = useState('3months');

  // Calculate date range based on the selected time frame
  const getCurrentDateRange = () => {
    const now = new Date();
    
    if (timeFrame === '1month') {
      return { start: subMonths(now, 1), end: now };
    } else if (timeFrame === '3months') {
      return { start: subMonths(now, 3), end: now };
    } else if (timeFrame === '6months') {
      return { start: subMonths(now, 6), end: now };
    } else { // 12months
      return { start: subMonths(now, 12), end: now };
    }
  };

  const dateRange = getCurrentDateRange();

  // Filter activities by date range
  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return isWithinInterval(activityDate, { start: dateRange.start, end: dateRange.end });
  });

  // Filter other data by date range
  const filteredReferrals = referrals.filter(item => {
    const itemDate = new Date(item.date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  const filteredVisitors = visitors.filter(item => {
    const itemDate = new Date(item.visitDate);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  const filteredOneToOnes = oneToOnes.filter(item => {
    const itemDate = new Date(item.meetingDate);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  const filteredTYFCBs = tyfcbs.filter(item => {
    const itemDate = new Date(item.date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  // Prepare data for charts
  const generateMonthlyData = () => {
    const months = [];
    let current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      months.push({
        name: format(current, 'MMM yyyy'),
        start: startOfMonth(current),
        end: endOfMonth(current)
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    
    return months.map(month => {
      const monthReferrals = filteredReferrals.filter(item => 
        isWithinInterval(new Date(item.date), { start: month.start, end: month.end })
      );
      
      const monthVisitors = filteredVisitors.filter(item => 
        isWithinInterval(new Date(item.visitDate), { start: month.start, end: month.end })
      );
      
      const monthOneToOnes = filteredOneToOnes.filter(item => 
        isWithinInterval(new Date(item.meetingDate), { start: month.start, end: month.end })
      );
      
      const monthTYFCBs = filteredTYFCBs.filter(item => 
        isWithinInterval(new Date(item.date), { start: month.start, end: month.end })
      );
      
      return {
        month: month.name,
        referrals: monthReferrals.length,
        visitors: monthVisitors.length,
        oneToOnes: monthOneToOnes.length,
        tyfcb: monthTYFCBs.reduce((sum, item) => sum + item.amount, 0)
      };
    });
  };

  const monthlyData = generateMonthlyData();

  // Data for the pie chart
  const activityTypeData = [
    { name: 'Referrals', value: filteredReferrals.length, color: '#8884d8' },
    { name: 'Visitors', value: filteredVisitors.length, color: '#82ca9d' },
    { name: 'One to Ones', value: filteredOneToOnes.length, color: '#ffc658' },
    { name: 'TYFCB', value: filteredTYFCBs.length, color: '#ff8042' }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Track group performance and metrics</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Label htmlFor="timeframe">Time Frame</Label>
          <Select defaultValue={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger id="timeframe" className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Referrals</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {filteredReferrals.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visitors</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {filteredVisitors.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">One-to-Ones</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {filteredOneToOnes.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">TYFCB</CardTitle>
            <CardDescription className="text-2xl font-bold">
              ${filteredTYFCBs.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activity Trends</TabsTrigger>
          <TabsTrigger value="tyfcb">Closed Business</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>Distribution of activities by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {activityTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Activities</CardTitle>
                <CardDescription>Comparison of activities over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="referrals" fill="#8884d8" name="Referrals" />
                      <Bar dataKey="visitors" fill="#82ca9d" name="Visitors" />
                      <Bar dataKey="oneToOnes" fill="#ffc658" name="One-to-Ones" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>Number of activities over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="referrals" stroke="#8884d8" name="Referrals" />
                    <Line type="monotone" dataKey="visitors" stroke="#82ca9d" name="Visitors" />
                    <Line type="monotone" dataKey="oneToOnes" stroke="#ffc658" name="One-to-Ones" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tyfcb">
          <Card>
            <CardHeader>
              <CardTitle>Closed Business Trends</CardTitle>
              <CardDescription>Amount of closed business over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'TYFCB']} />
                    <Legend />
                    <Bar dataKey="tyfcb" fill="#ff8042" name="Closed Business ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
