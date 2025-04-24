import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks, 
  startOfDay,
  endOfDay,
  parseISO,
  addDays,
} from 'date-fns';
import { startOfTuesday, previousTuesday, isAfter, isBefore, isSameDay, isWithinInterval, eachWeekOfInterval } from '@/utils/dateUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CalendarIcon, PieChart, BarChart, Trophy, Filter, FileText } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as ReChartPieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend,
  BarChart as ReChartBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  LineChart,
  Line
} from 'recharts';

export const getDataSinceLastTuesday = () => {
  const { referrals, visitors, oneToOnes, tyfcbs, users } = useData();
  
  const now = new Date();
  const lastTuesday = previousTuesday(now);
  lastTuesday.setHours(0, 0, 0, 0); // Start of last Tuesday
  
  const recentReferrals = referrals.filter(item => {
    const itemDate = new Date(item.date);
    return isAfter(itemDate, lastTuesday);
  });
  
  const recentVisitors = visitors.filter(item => {
    const itemDate = new Date(item.visitDate);
    return isAfter(itemDate, lastTuesday) && !item.didNotShow;
  });
  
  const recentOneToOnes = oneToOnes.filter(item => {
    const itemDate = new Date(item.date);
    return isAfter(itemDate, lastTuesday);
  });
  
  const recentTYFCBs = tyfcbs.filter(item => {
    const itemDate = new Date(item.date);
    return isAfter(itemDate, lastTuesday);
  });
  
  const memberMetrics = users.map(user => {
    const userReferrals = recentReferrals.filter(item => item.fromMemberId === user.id);
    const userVisitors = recentVisitors.filter(item => item.hostMemberId === user.id);
    const userOneToOnes = recentOneToOnes.filter(item => 
      item.member1Id === user.id || item.member2Id === user.id
    );
    const userTYFCBs = recentTYFCBs.filter(item => item.fromMemberId === user.id);
    
    return {
      user,
      referrals: userReferrals.length,
      visitors: userVisitors.length,
      oneToOnes: userOneToOnes.length,
      tyfcb: userTYFCBs.reduce((sum, item) => sum + item.amount, 0)
    };
  }).filter(metric => 
    metric.referrals > 0 || metric.visitors > 0 || metric.oneToOnes > 0 || metric.tyfcb > 0
  );
  
  const topReferrals = [...memberMetrics].sort((a, b) => b.referrals - a.referrals)[0];
  const topVisitors = [...memberMetrics].sort((a, b) => b.visitors - a.visitors)[0];
  const topOneToOnes = [...memberMetrics].sort((a, b) => b.oneToOnes - a.oneToOnes)[0];
  const topTYFCB = [...memberMetrics].sort((a, b) => b.tyfcb - a.tyfcb)[0];
  
  return {
    total: {
      referrals: recentReferrals.length,
      visitors: recentVisitors.length,
      oneToOnes: recentOneToOnes.length,
      tyfcb: recentTYFCBs.reduce((sum, item) => sum + item.amount, 0)
    },
    memberMetrics,
    topPerformers: {
      topReferrals,
      topVisitors,
      topOneToOnes,
      topTYFCB
    },
    startDate: lastTuesday,
    endDate: now
  };
};

const Reports = () => {
  const { referrals, visitors, oneToOnes, tyfcbs, users, activities, getTopPerformers, getUserMetrics } = useData();
  const { currentUser } = useAuth();
  const [timeFrame, setTimeFrame] = useState('3months');
  const [viewMode, setViewMode] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);
  
  const topPerformers = getTopPerformers();
  const isAdmin = currentUser?.isAdmin;

  const getCurrentDateRange = () => {
    const now = new Date();
    
    if (customDateRange.from && customDateRange.to) {
      return { start: startOfDay(customDateRange.from), end: endOfDay(customDateRange.to) };
    }
    
    if (timeFrame === '1month') {
      return { start: subMonths(now, 1), end: now };
    } else if (timeFrame === '3months') {
      return { start: subMonths(now, 3), end: now };
    } else if (timeFrame === '6months') {
      return { start: subMonths(now, 6), end: now };
    } else if (timeFrame === '1week') {
      return { start: subWeeks(now, 1), end: now };
    } else if (timeFrame === '4weeks') {
      return { start: subWeeks(now, 4), end: now };
    } else { // 12months
      return { start: subMonths(now, 12), end: now };
    }
  };

  const dateRange = getCurrentDateRange();
  const isCustomRange = customDateRange.from && customDateRange.to;

  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return isWithinInterval(activityDate, { start: dateRange.start, end: dateRange.end });
  });

  const filteredReferrals = referrals.filter(item => {
    const itemDate = new Date(item.date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  const filteredVisitors = visitors.filter(item => {
    if (item.didNotShow) {
      return false;
    }
    
    const itemDate = new Date(item.visitDate);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  const filteredOneToOnes = oneToOnes.filter(item => {
    const itemDate = new Date(item.date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  const filteredTYFCBs = tyfcbs.filter(item => {
    const itemDate = new Date(item.date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  const generateChartData = () => {
    if (viewMode === 'weekly') {
      return generateWeeklyData();
    } else if (viewMode === 'daily') {
      return generateDailyData();
    } else {
      return generateMonthlyData();
    }
  };

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
        isWithinInterval(new Date(item.date), { start: month.start, end: month.end })
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

  const generateWeeklyData = () => {
    const weeks = eachWeekOfInterval({
      start: dateRange.start,
      end: dateRange.end
    });
    
    return weeks.map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart);
      
      const weekReferrals = filteredReferrals.filter(item => 
        isWithinInterval(new Date(item.date), { start: weekStart, end: weekEnd })
      );
      
      const weekVisitors = filteredVisitors.filter(item => 
        isWithinInterval(new Date(item.visitDate), { start: weekStart, end: weekEnd })
      );
      
      const weekOneToOnes = filteredOneToOnes.filter(item => 
        isWithinInterval(new Date(item.date), { start: weekStart, end: weekEnd })
      );
      
      const weekTYFCBs = filteredTYFCBs.filter(item => 
        isWithinInterval(new Date(item.date), { start: weekStart, end: weekEnd })
      );
      
      return {
        week: `Week ${index + 1} (${format(weekStart, 'MMM d')})`,
        referrals: weekReferrals.length,
        visitors: weekVisitors.length,
        oneToOnes: weekOneToOnes.length,
        tyfcb: weekTYFCBs.reduce((sum, item) => sum + item.amount, 0)
      };
    });
  };

  const generateDailyData = () => {
    if (!customDateRange.from || !customDateRange.to) {
      return [];
    }
    
    const days = eachDayOfInterval({
      start: customDateRange.from,
      end: customDateRange.to
    });
    
    return days.map(day => {
      const dayReferrals = filteredReferrals.filter(item => 
        isSameDay(new Date(item.date), day)
      );
      
      const dayVisitors = filteredVisitors.filter(item => 
        isSameDay(new Date(item.visitDate), day)
      );
      
      const dayOneToOnes = filteredOneToOnes.filter(item => 
        isSameDay(new Date(item.date), day)
      );
      
      const dayTYFCBs = filteredTYFCBs.filter(item => 
        isSameDay(new Date(item.date), day)
      );
      
      return {
        day: format(day, 'MMM d'),
        referrals: dayReferrals.length,
        visitors: dayVisitors.length,
        oneToOnes: dayOneToOnes.length,
        tyfcb: dayTYFCBs.reduce((sum, item) => sum + item.amount, 0)
      };
    });
  };

  const chartData = generateChartData();

  const activityTypeData = [
    { name: 'Referrals', value: filteredReferrals.length, color: '#8884d8' },
    { name: 'Visitors', value: filteredVisitors.length, color: '#82ca9d' },
    { name: 'One to Ones', value: filteredOneToOnes.length, color: '#ffc658' },
    { name: 'TYFCB', value: filteredTYFCBs.length, color: '#ff8042' }
  ];

  const handleCustomDateSelect = (range: { from?: Date, to?: Date }) => {
    setCustomDateRange({
      from: range.from,
      to: range.to
    });
    
    if (range.from && range.to) {
      setTimeFrame('custom');
      const dayDiff = Math.ceil(
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDiff <= 14) {
        setViewMode('daily');
      } else if (dayDiff <= 60) {
        setViewMode('weekly');
      } else {
        setViewMode('monthly');
      }
    }
  };

  const resetCustomDate = () => {
    setCustomDateRange({
      from: undefined,
      to: undefined
    });
    setTimeFrame('3months');
    setViewMode('monthly');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Track group performance and metrics</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {isAdmin && (
            <Dialog open={weeklyReportOpen} onOpenChange={setWeeklyReportOpen}>
              <DialogTrigger asChild>
                <Button className="bg-maroon hover:bg-maroon/90 mb-2 sm:mb-0">
                  <FileText className="mr-2 h-4 w-4" />
                  Weekly Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Weekly Report</DialogTitle>
                  <DialogDescription>
                    Activity since {format(getDataSinceLastTuesday().startDate, "EEEE, MMMM d")} at 12:00 AM
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <WeeklyReport data={getDataSinceLastTuesday()} />
                </ScrollArea>
                <div className="flex justify-end mt-4">
                  <DialogClose asChild>
                    <Button className="bg-maroon hover:bg-maroon/90">Close</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <div>
            <Label htmlFor="timeframe">Time Frame</Label>
            <Select 
              value={timeFrame} 
              onValueChange={val => {
                setTimeFrame(val);
                if (val !== 'custom') {
                  setCustomDateRange({ from: undefined, to: undefined });
                }
              }}
            >
              <SelectTrigger id="timeframe" className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">Last Week</SelectItem>
                <SelectItem value="4weeks">Last 4 Weeks</SelectItem>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="viewmode">View Mode</Label>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger id="viewmode" className="w-[180px]">
                <SelectValue placeholder="Select view mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                {isCustomRange && <SelectItem value="daily">Daily</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          {timeFrame === 'custom' && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-end">
              <div className="space-y-1">
                <Label>Custom Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[250px] justify-start text-left font-normal",
                        !customDateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.from ? (
                        customDateRange.to ? (
                          <>
                            {format(customDateRange.from, "MMM d, yyyy")} -{" "}
                            {format(customDateRange.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          format(customDateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={customDateRange.from}
                      selected={{
                        from: customDateRange.from,
                        to: customDateRange.to,
                      }}
                      onSelect={handleCustomDateSelect}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {(customDateRange.from && customDateRange.to) && (
                <Button variant="outline" size="sm" onClick={resetCustomDate}>
                  Reset
                </Button>
              )}
            </div>
          )}
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
                    <ReChartPieChart>
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
                      <RechartsTooltip />
                      <RechartsLegend />
                    </ReChartPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {viewMode === 'monthly' 
                    ? 'Monthly Activities' 
                    : viewMode === 'weekly' 
                      ? 'Weekly Activities' 
                      : 'Daily Activities'}
                </CardTitle>
                <CardDescription>Comparison of activities over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartBarChart data={chartData}>
                      <XAxis 
                        dataKey={
                          viewMode === 'monthly' 
                            ? 'month' 
                            : viewMode === 'weekly' 
                              ? 'week' 
                              : 'day'
                        } 
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <RechartsLegend />
                      <RechartsBar dataKey="referrals" fill="#8884d8" name="Referrals" />
                      <RechartsBar dataKey="visitors" fill="#82ca9d" name="Visitors" />
                      <RechartsBar dataKey="oneToOnes" fill="#ffc658" name="One-to-Ones" />
                    </ReChartBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Top Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topPerformers.topReferrals && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Referrals</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={topPerformers.topReferrals.user.profilePicture} alt="Profile" />
                        <AvatarFallback>
                          {topPerformers.topReferrals.user.firstName.charAt(0)}
                          {topPerformers.topReferrals.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {topPerformers.topReferrals.user.firstName} {topPerformers.topReferrals.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{topPerformers.topReferrals.count} referrals</p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {topPerformers.topVisitors && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Visitors</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={topPerformers.topVisitors.user.profilePicture} alt="Profile" />
                        <AvatarFallback>
                          {topPerformers.topVisitors.user.firstName.charAt(0)}
                          {topPerformers.topVisitors.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {topPerformers.topVisitors.user.firstName} {topPerformers.topVisitors.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{topPerformers.topVisitors.count} visitors</p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {topPerformers.topOneToOnes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Top One-to-Ones</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={topPerformers.topOneToOnes.user.profilePicture} alt="Profile" />
                        <AvatarFallback>
                          {topPerformers.topOneToOnes.user.firstName.charAt(0)}
                          {topPerformers.topOneToOnes.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {topPerformers.topOneToOnes.user.firstName} {topPerformers.topOneToOnes.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{topPerformers.topOneToOnes.count} one-to-ones</p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {topPerformers.topTYFCB && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Top TYFCB</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={topPerformers.topTYFCB.user.profilePicture} alt="Profile" />
                        <AvatarFallback>
                          {topPerformers.topTYFCB.user.firstName.charAt(0)}
                          {topPerformers.topTYFCB.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {topPerformers.topTYFCB.user.firstName} {topPerformers.topTYFCB.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">${topPerformers.topTYFCB.amount.toLocaleString()}</p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Member Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Member</th>
                    <th className="text-center py-2 px-4">Referrals</th>
                    <th className="text-center py-2 px-4">Visitors</th>
                    <th className="text-center py-2 px-4">One-to-Ones</th>
                    <th className="text-center py-2 px-4">TYFCB</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const metrics = getUserMetrics(user.id);
                    
                    if (metrics.referrals === 0 && metrics.visitors === 0 && 
                        metrics.oneToOnes === 0 && metrics.tyfcb.amount === 0) {
                      return null;
                    }
                    
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profilePicture} alt="Profile" />
                              <AvatarFallback>
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.businessName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-2 px-4">
                          {metrics.referrals}
                          {metrics.referrals > 0 && topPerformers.topReferrals?.user.id === user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                        <td className="text-center py-2 px-4">
                          {metrics.visitors}
                          {metrics.visitors > 0 && topPerformers.topVisitors?.user.id === user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                        <td className="text-center py-2 px-4">
                          {metrics.oneToOnes}
                          {metrics.oneToOnes > 0 && topPerformers.topOneToOnes?.user.id === user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                        <td className="text-center py-2 px-4">
                          ${metrics.tyfcb.amount.toLocaleString()}
                          {metrics.tyfcb.amount > 0 && topPerformers.topTYFCB?.user.id === user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey={
                        viewMode === 'monthly' 
                          ? 'month' 
                          : viewMode === 'weekly' 
                            ? 'week' 
                            : 'day'
                      } 
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <RechartsLegend />
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
                  <ReChartBarChart data={chartData}>
                    <XAxis 
                      dataKey={
                        viewMode === 'monthly' 
                          ? 'month' 
                          : viewMode === 'weekly' 
                            ? 'week' 
                            : 'day'
                      } 
                    />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'TYFCB']} />
                    <RechartsLegend />
                    <RechartsBar dataKey="tyfcb" fill="#ff8042" name="Closed Business ($)" />
                  </ReChartBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface WeeklyReportProps {
  data: {
    total: {
      referrals: number;
      visitors: number;
      oneToOnes: number;
      tyfcb: number;
    };
    memberMetrics: Array<{
      user: any;
      referrals: number;
      visitors: number;
      oneToOnes: number;
      tyfcb: number;
    }>;
    topPerformers: {
      topReferrals?: {
        user: any;
        referrals: number;
      };
      topVisitors?: {
        user: any;
        visitors: number;
      };
      topOneToOnes?: {
        user: any;
        oneToOnes: number;
      };
      topTYFCB?: {
        user: any;
        tyfcb: number;
      };
    };
    startDate: Date;
    endDate: Date;
  };
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Report Period</h3>
        <p className="text-gray-600">
          From {format(data.startDate, "EEEE, MMMM d, yyyy")} at 12:00 AM<br />
          To {format(data.endDate, "EEEE, MMMM d, yyyy")} at {format(data.endDate, "h:mm a")}
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Totals</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Referrals</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {data.total.referrals}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visitors</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {data.total.visitors}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">One-to-Ones</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {data.total.oneToOnes}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">TYFCB</CardTitle>
              <CardDescription className="text-2xl font-bold">
                ${data.total.tyfcb.toLocaleString()}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.topPerformers.topReferrals && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Referrals</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={data.topPerformers.topReferrals.user.profilePicture} alt="Profile" />
                    <AvatarFallback>
                      {data.topPerformers.topReferrals.user.firstName.charAt(0)}
                      {data.topPerformers.topReferrals.user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {data.topPerformers.topReferrals.user.firstName} {data.topPerformers.topReferrals.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{data.topPerformers.topReferrals.referrals} referrals</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {data.topPerformers.topVisitors && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Visitors</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={data.topPerformers.topVisitors.user.profilePicture} alt="Profile" />
                    <AvatarFallback>
                      {data.topPerformers.topVisitors.user.firstName.charAt(0)}
                      {data.topPerformers.topVisitors.user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {data.topPerformers.topVisitors.user.firstName} {data.topPerformers.topVisitors.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{data.topPerformers.topVisitors.visitors} visitors</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {data.topPerformers.topOneToOnes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top One-to-Ones</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={data.topPerformers.topOneToOnes.user.profilePicture} alt="Profile" />
                    <AvatarFallback>
                      {data.topPerformers.topOneToOnes.user.firstName.charAt(0)}
                      {data.topPerformers.topOneToOnes.user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {data.topPerformers.topOneToOnes.user.firstName} {data.topPerformers.topOneToOnes.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{data.topPerformers.topOneToOnes.oneToOnes} one-to-ones</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {data.topPerformers.topTYFCB && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top TYFCB</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={data.topPerformers.topTYFCB.user.profilePicture} alt="Profile" />
                    <AvatarFallback>
                      {data.topPerformers.topTYFCB.user.firstName.charAt(0)}
                      {data.topPerformers.topTYFCB.user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {data.topPerformers.topTYFCB.user.firstName} {data.topPerformers.topTYFCB.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">${data.topPerformers.topTYFCB.tyfcb.toLocaleString()}</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Member Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Member</th>
                <th className="text-center py-2 px-4">Referrals</th>
                <th className="text-center py-2 px-4">Visitors</th>
                <th className="text-center py-2 px-4">One-to-Ones</th>
                <th className="text-center py-2 px-4">TYFCB</th>
              </tr>
            </thead>
            <tbody>
              {data.memberMetrics.map(metric => (
                <tr key={metric.user.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={metric.user.profilePicture} alt="Profile" />
                        <AvatarFallback>
                          {metric.user.firstName.charAt(0)}
                          {metric.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{metric.user.firstName} {metric.user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{metric.user.businessName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-2 px-4">
                    {metric.referrals}
                    {data.topPerformers.topReferrals && 
                      metric.referrals > 0 && 
                      data.topPerformers.topReferrals.user.id === metric.user.id && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                    )}
                  </td>
                  <td className="text-center py-2 px-4">
                    {metric.visitors}
                    {data.topPerformers.topVisitors && 
                      metric.visitors > 0 && 
                      data.topPerformers.topVisitors.user.id === metric.user.id && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                    )}
                  </td>
                  <td className="text-center py-2 px-4">
                    {metric.oneToOnes}
                    {data.topPerformers.topOneToOnes && 
                      metric.oneToOnes > 0 && 
                      data.topPerformers.topOneToOnes.user.id === metric.user.id && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                    )}
                  </td>
                  <td className="text-center py-2 px-4">
                    ${metric.tyfcb.toLocaleString()}
                    {data.topPerformers.topTYFCB && 
                      metric.tyfcb > 0 && 
                      data.topPerformers.topTYFCB.user.id === metric.user.id && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
