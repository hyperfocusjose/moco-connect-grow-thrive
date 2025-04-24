
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { User, Visitor } from '@/types';
import { MemberCard } from '@/components/directory/MemberCard';
import { MemberDetail } from '@/components/directory/MemberDetail';
import { VisitorDetail } from '@/components/directory/VisitorDetail';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Plus, X, Users, UserCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MemberForm } from '@/components/forms/member/MemberForm';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Directory: React.FC = () => {
  const { users, visitors, markVisitorNoShow, fetchUsers } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  const [includeNoShows, setIncludeNoShows] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isVisitorDetailOpen, setIsVisitorDetailOpen] = useState(false);
  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter members - making sure to exclude admin users
  const filteredMembers = users.filter(member => {
    // First, explicitly filter out admin users
    if (member.isAdmin) {
      return false;
    }
    
    // Then filter out incomplete profiles
    if (!member.firstName || !member.lastName) {
      return false;
    }
    
    // Finally, apply search filter if there's a search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        member.firstName.toLowerCase().includes(searchLower) ||
        member.lastName.toLowerCase().includes(searchLower) ||
        member.businessName.toLowerCase().includes(searchLower) ||
        member.industry.toLowerCase().includes(searchLower) ||
        member.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Include this non-admin member with complete profile
    return true;
  });

  // Count of actual members (excluding admins)
  const totalMembers = users.filter(user => user.firstName && user.lastName && !user.isAdmin).length;

  const filteredVisitors = visitors ? visitors.filter(visitor => {
    if (!includeNoShows && visitor.didNotShow) {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const visitorName = visitor.visitorName || '';
    const visitorBusiness = visitor.visitorBusiness || '';
    const hostMemberName = visitor.hostMemberName || '';
    const didNotShowMatch = visitor.didNotShow && 'no show'.includes(searchLower);
    
    return (
      visitorName.toLowerCase().includes(searchLower) ||
      visitorBusiness.toLowerCase().includes(searchLower) ||
      hostMemberName.toLowerCase().includes(searchLower) ||
      new Date(visitor.visitDate).toLocaleDateString().includes(searchLower) ||
      didNotShowMatch
    );
  }) : [];

  // Total visitor count
  const totalVisitors = visitors ? visitors.length : 0;
  // Count of visitors who showed up
  const showedVisitors = visitors ? visitors.filter(v => !v.didNotShow).length : 0;

  const handleSelectMember = (member: User) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleEditMember = (member: User) => {
    setMemberToEdit(member);
    setIsEditFormOpen(true);
  };

  const handleAddMember = () => {
    setIsAddFormOpen(true);
  };

  const handleMarkNoShow = async (visitorId: string) => {
    try {
      await markVisitorNoShow(visitorId);
      toast.success('Visitor marked as no-show');
    } catch (error) {
      console.error('Error marking visitor as no-show:', error);
      toast.error('Failed to mark visitor as no-show');
    }
  };

  const handleSelectVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsVisitorDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Member Directory</h1>
        {isAdmin && (
          <Button 
            className="bg-maroon hover:bg-maroon/90"
            onClick={handleAddMember}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Member
          </Button>
        )}
      </div>
      
      <Tabs 
        defaultValue="members" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="visitors">Past Visitors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members">
          <div className="flex justify-between items-center mb-6">
            <Card className="flex-grow">
              <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-medium">Total Members</CardTitle>
                  <CardDescription>Active group members</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-green-100 p-2">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold">{totalMembers}</span>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, business, industry, or services..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onClick={() => handleSelectMember(member)}
                showEditButton={isAdmin}
                onEdit={() => handleEditMember(member)}
              />
            ))}
            {filteredMembers.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No members found matching your search criteria.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="visitors">
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-no-shows"
                  checked={includeNoShows}
                  onCheckedChange={setIncludeNoShows}
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisitors.map((visitor) => (
                <div 
                  key={visitor.id} 
                  className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectVisitor(visitor)}
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
                            handleMarkNoShow(visitor.id);
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
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md p-0" onInteractOutside={(e) => e.preventDefault()}>
          {selectedMember && (
            <MemberDetail 
              member={selectedMember}
              onClose={handleCloseDetail}
              onEdit={() => {
                handleCloseDetail();
                handleEditMember(selectedMember);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-lg p-0" onInteractOutside={(e) => e.preventDefault()}>
          {memberToEdit && (
            <MemberForm 
              member={memberToEdit}
              onComplete={() => setIsEditFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="sm:max-w-lg p-0" onInteractOutside={(e) => e.preventDefault()}>
          <MemberForm 
            onComplete={() => setIsAddFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isVisitorDetailOpen} onOpenChange={setIsVisitorDetailOpen}>
        <DialogContent className="sm:max-w-md p-0" onInteractOutside={(e) => e.preventDefault()}>
          {selectedVisitor && (
            <VisitorDetail
              visitor={selectedVisitor}
              onClose={() => setIsVisitorDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Directory;
