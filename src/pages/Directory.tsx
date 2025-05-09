import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { User, Visitor } from '@/types';
import { MemberDetail } from '@/components/directory/MemberDetail';
import { VisitorDetail } from '@/components/directory/VisitorDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, RefreshCw, AlertTriangle, Database } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MemberForm } from '@/components/forms/member/MemberForm';
import { toast } from 'sonner';
import { MembersSection } from '@/components/directory/MembersSection';
import { VisitorsSection } from '@/components/directory/VisitorsSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const Directory: React.FC = () => {
  const { 
    users, 
    visitors, 
    markVisitorNoShow, 
    fetchUsers, 
    reloadData,
    isLoading, 
    loadError 
  } = useData();
  
  const { 
    currentUser, 
    isAuthenticated, 
    sessionValid, 
    refreshSession 
  } = useAuth();
  
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
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    console.log("Directory: Loading initial data");
    fetchUsers();
  }, [fetchUsers]);
  
  // Handle authentication status changes
  useEffect(() => {
    console.log("Directory: Authentication status changed - ", { 
      isAuthenticated, 
      sessionValid, 
      hasCurrentUser: !!currentUser 
    });
    
    if (!isAuthenticated || !sessionValid) {
      console.warn("Directory: Not authenticated or session invalid");
    }
  }, [isAuthenticated, sessionValid, currentUser]);

  // Add effect to handle auth error conditions detected during data loading
  useEffect(() => {
    if (loadError && (loadError.includes('authentication') || loadError.includes('auth'))) {
      console.error("Directory: Authentication error detected:", loadError);
    }
  }, [loadError]);

  // Log data to debug data loading issues
  useEffect(() => {
    console.log("Directory component mounted/updated");
    console.log("Current user:", currentUser);
    console.log("All users:", users);
    console.log("Users count:", users.length);
    console.log("Admin status:", isAdmin);
    console.log("Data loading state:", isLoading);
    console.log("Data error state:", loadError);
    console.log("Authentication state:", { isAuthenticated, sessionValid });
  }, [currentUser, users, isAdmin, isLoading, loadError, isAuthenticated, sessionValid]);

  const checkRlsAccess = async () => {
    try {
      setDataRefreshing(true);
      
      // Diagnostic data collection
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Direct query test
      const { data: profileData, error: profileError, status: profileStatus } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      const newDebugInfo = {
        timestamp: new Date().toISOString(),
        auth: {
          isAuthenticated,
          sessionValid,
          hasCurrentUser: !!currentUser,
          hasSession: !!sessionData.session,
          sessionExpiry: sessionData.session ? new Date(sessionData.session.expires_at * 1000).toISOString() : null,
        },
        directProfiles: {
          status: profileStatus,
          error: profileError?.message || null,
          count: profileData?.length || 0,
        },
        users: {
          count: users.length,
          loadError: loadError || null,
          isLoading
        }
      };
      
      setDebugInfo(newDebugInfo);
      setShowDebugInfo(true);
      
      if (profileData && profileData.length > 0) {
        toast.success(`Direct query success: Retrieved ${profileData.length} profiles!`);
      } else if (profileError) {
        toast.error(`Direct query failed: ${profileError.message}`);
      } else {
        toast.warning('Direct query returned no profiles');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error checking access: ${errorMsg}`);
    } finally {
      setDataRefreshing(false);
    }
  };

  const handleRefreshData = async () => {
    setDataRefreshing(true);
    try {
      await refreshSession();
      await reloadData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setDataRefreshing(false);
    }
  };

  const filteredMembers = users.filter(member => {
    if (!member.firstName || !member.lastName) {
      console.log(`Filtering out user with missing name: ID ${member.id}`);
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.businessName.toLowerCase().includes(searchLower) ||
      member.industry.toLowerCase().includes(searchLower) ||
      member.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const totalMembers = users.filter(user => user.firstName && user.lastName).length;

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

  // Check if the users array exists but is empty (possibly due to auth issues)
  const hasNoUsers = users.length === 0 && !isLoading;
  const hasAuthError = loadError && (
    loadError.includes('authentication') || 
    loadError.includes('auth') || 
    loadError.toLowerCase().includes('session') ||
    loadError.toLowerCase().includes('security')
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Member Directory</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={checkRlsAccess}
            disabled={dataRefreshing}
            className="flex items-center gap-1"
          >
            <Database className="h-4 w-4" />
            Test DB Access
          </Button>
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={dataRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${dataRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
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
      </div>
      
      {showDebugInfo && debugInfo && (
        <Alert className="mb-4 bg-gray-100">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-bold">Database Access Debug Info</h3>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDebugInfo(false)}>
              Hide
            </Button>
          </div>
        </Alert>
      )}
      
      {hasAuthError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Authentication issue detected. Please try refreshing your browser or logging out and back in.
            <div className="mt-2">
              <Button 
                onClick={async () => {
                  await refreshSession();
                  await reloadData();
                }} 
                variant="outline" 
                size="sm"
              >
                Refresh Session
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasNoUsers && !loadError && !isLoading && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            No members found. This may be due to an authentication issue or because no members have been added yet.
          </AlertDescription>
        </Alert>
      )}
      
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
            onEditMember={handleEditMember}
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
