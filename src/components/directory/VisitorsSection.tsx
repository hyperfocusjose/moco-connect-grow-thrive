
import React from 'react';
import { Visitor } from '@/types';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, Users, UserCheck, X } from 'lucide-react';

interface VisitorsSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  includeNoShows: boolean;
  onIncludeNoShowsChange: (value: boolean) => void;
  filteredVisitors: Visitor[];
  totalVisitors: number;
  showedVisitors: number;
  onSelectVisitor: (visitor: Visitor) => void;
  onMarkNoShow: (visitorId: string) => void;
  isAdmin: boolean;
}

export const VisitorsSection = ({
  searchTerm,
  onSearchChange,
  includeNoShows,
  onIncludeNoShowsChange,
  filteredVisitors,
  totalVisitors,
  showedVisitors,
  onSelectVisitor,
  onMarkNoShow,
  isAdmin,
}: VisitorsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-medium">Total Visitors</CardTitle>
              <CardDescription>All time</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold">{totalVisitors}</span>
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-medium">Attended</CardTitle>
              <CardDescription>Visitors who showed up</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 p-2">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold">{showedVisitors}</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="include-no-shows"
            checked={includeNoShows}
            onCheckedChange={onIncludeNoShowsChange}
          />
          <Label htmlFor="include-no-shows">Include no-shows</Label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, business, host member, date, or 'no show'..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisitors.map((visitor) => (
          <div 
            key={visitor.id} 
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectVisitor(visitor)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{visitor.visitorName}</h3>
                <p className="text-sm text-muted-foreground">{visitor.visitorBusiness}</p>
                {visitor.hostMemberName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Invited by: {visitor.hostMemberName}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {visitor.didNotShow ? (
                  <Badge variant="destructive">No Show</Badge>
                ) : isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkNoShow(visitor.id);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" /> Mark No-Show
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500">
                Visit date: {format(new Date(visitor.visitDate), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        ))}
        {filteredVisitors.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No past visitors found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
