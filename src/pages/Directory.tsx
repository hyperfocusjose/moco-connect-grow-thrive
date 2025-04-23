import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { User } from '@/types';
import { MemberCard } from '@/components/directory/MemberCard';
import { MemberDetail } from '@/components/directory/MemberDetail';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Plus, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MemberForm } from '@/components/forms/MemberForm';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Directory: React.FC = () => {
  const { users, visitors, markVisitorNoShow } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  
  const isAdmin = currentUser?.isAdmin;

  // Filter members based on search term
  const filteredMembers = users.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.businessName.toLowerCase().includes(searchLower) ||
      member.industry.toLowerCase().includes(searchLower) ||
      member.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
  
  // Filter past visitors
  const filteredVisitors = visitors ? visitors.filter(visitor => {
    const searchLower = searchTerm.toLowerCase();
    const visitorName = visitor.visitorName || '';
    const visitorBusiness = visitor.visitorBusiness || '';
    
    return (
      visitorName.toLowerCase().includes(searchLower) ||
      visitorBusiness.toLowerCase().includes(searchLower) ||
      new Date(visitor.visitDate).toLocaleDateString().includes(searchLower)
    );
  }) : [];

  // Open member detail dialog
  const handleSelectMember = (member: User) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  // Close member detail dialog
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };
  
  // Handle edit member button click
  const handleEditMember = (member: User) => {
    setMemberToEdit(member);
    setIsEditFormOpen(true);
  };
  
  // Handle add new member button click
  const handleAddMember = () => {
    setIsAddFormOpen(true);
  };
  
  // Handle marking a visitor as no-show
  const handleMarkNoShow = async (visitorId: string) => {
    try {
      await markVisitorNoShow(visitorId);
      toast.success('Visitor marked as no-show');
    } catch (error) {
      console.error('Error marking visitor as no-show:', error);
      toast.error('Failed to mark visitor as no-show');
    }
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
          {/* Search input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, business, industry, or services..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Members grid */}
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
          {/* Search input for visitors */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search past visitors by name, business, or date..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Visitors grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{visitor.visitorName}</h3>
                    <p className="text-sm text-muted-foreground">{visitor.visitorBusiness}</p>
                  </div>
                  <div className="flex gap-2">
                    {visitor.didNotShow ? (
                      <Badge variant="destructive">No Show</Badge>
                    ) : isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleMarkNoShow(visitor.id)}
                    >
                      <X className="h-3 w-3 mr-1" /> Mark No-Show
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500 flex flex-col gap-1">
                  <div>Visit date: {format(new Date(visitor.visitDate), 'MMM dd, yyyy')}</div>
                  {visitor.email && <div>Email: {visitor.email}</div>}
                  {visitor.phoneNumber && <div>Phone: {visitor.phoneNumber}</div>}
                  {visitor.industry && <div>Industry: {visitor.industry}</div>}
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
      </TabsContent>

      {/* Member detail dialog */}
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
      
      {/* Edit Member Dialog */}
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
      
      {/* Add Member Dialog */}
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="sm:max-w-lg p-0" onInteractOutside={(e) => e.preventDefault()}>
          <MemberForm 
            onComplete={() => setIsAddFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Directory;
