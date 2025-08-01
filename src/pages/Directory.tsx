import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { User, Visitor } from '@/types';
import { MemberDetail } from '@/components/directory/MemberDetail';
import { VisitorDetail } from '@/components/directory/VisitorDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MemberForm } from '@/components/forms/member/MemberForm';
import { toast } from 'sonner';
import { MembersSection } from '@/components/directory/MembersSection';
import { VisitorsSection } from '@/components/directory/VisitorsSection';
import { DataDebugPanel } from '@/components/debug/DataDebugPanel';

const Directory: React.FC = () => {
  const { 
    users, 
    visitors, 
    markVisitorNoShow, 
    isLoading, 
    loadError
  } = useData();
  
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


  const filteredMembers = users.filter(member => {
    if (!member.firstName && !member.lastName) {
      console.log(`Filtering out user with missing name: ID ${member.id}`);
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (member.firstName?.toLowerCase() || '').includes(searchLower) ||
      (member.lastName?.toLowerCase() || '').includes(searchLower) ||
      (member.businessName?.toLowerCase() || '').includes(searchLower) ||
      (member.industry?.toLowerCase() || '').includes(searchLower) ||
      member.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const totalMembers = users.filter(user => user.firstName || user.lastName).length;

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

  const totalVisitors = visitors ? visitors.length : 0;
  const showedVisitors = visitors ? visitors.filter(v => !v.didNotShow).length : 0;

  const handleSelectMember = (member: User) => {
    console.log("Selected member:", member);
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleEditMember = (member: User) => {
    console.log("Editing member:", member);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Directory</h1>
        {isAdmin && (
          <Button 
            className="bg-maroon hover:bg-maroon/90"
            onClick={() => setIsAddFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Member
          </Button>
        )}
      </div>
      
      <DataDebugPanel />
      
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
          <MembersSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredMembers={filteredMembers}
            totalMembers={totalMembers}
            onSelectMember={handleSelectMember}
            isAdmin={isAdmin}
            onEditMember={(member) => {
              setMemberToEdit(member);
              setIsEditFormOpen(true);
            }}
            isLoading={isLoading}
            loadError={loadError}
          />
        </TabsContent>
        
        <TabsContent value="visitors">
          <VisitorsSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            includeNoShows={includeNoShows}
            onIncludeNoShowsChange={setIncludeNoShows}
            filteredVisitors={filteredVisitors}
            totalVisitors={totalVisitors}
            showedVisitors={showedVisitors}
            onSelectVisitor={handleSelectVisitor}
            onMarkNoShow={handleMarkNoShow}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>

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
      
      {/* Edit member form dialog */}
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
      
      {/* Add member form dialog */}
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="sm:max-w-lg p-0" onInteractOutside={(e) => e.preventDefault()}>
          <MemberForm 
            onComplete={() => setIsAddFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Visitor detail dialog */}
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
