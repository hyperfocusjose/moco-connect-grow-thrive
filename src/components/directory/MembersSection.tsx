import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { MemberCard } from '@/components/directory/MemberCard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, Check, Database, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MembersSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredMembers: User[];
  totalMembers: number;
  onSelectMember: (member: User) => void;
  isAdmin: boolean;
  onEditMember: (member: User) => void;
  isLoading?: boolean;
  loadError?: string | null;
}

export const MembersSection = ({
  searchTerm,
  onSearchChange,
  filteredMembers,
  totalMembers,
  onSelectMember,
  isAdmin,
  onEditMember,
  isLoading = false,
  loadError = null,
}: MembersSectionProps) => {
  const [error, setError] = useState<string | null>(loadError);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [rawProfiles, setRawProfiles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Keep persistent error state when loadError changes
  useEffect(() => {
    if (loadError) {
      setError(loadError);
    }
  }, [loadError]);

  // Direct database check
  const checkDatabaseAccess = async () => {
    try {
      setRefreshing(true);
      const { data: authData } = await supabase.auth.getSession();
      
      // Check session validity
      const hasSession = !!authData.session;
      
      // Try direct profiles query
      const { data, error: profilesError, status } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, business_name, industry, profile_picture')
        .limit(10);
        
      setDebugInfo({
        hasSession,
        sessionExpiry: authData.session ? new Date(authData.session.expires_at * 1000).toISOString() : 'No session',
        currentTime: new Date().toISOString(),
        profilesQueryStatus: status,
        profilesCount: data?.length || 0,
        profilesError: profilesError?.message || null,
        errorCode: profilesError?.code || null,
        profilesData: data ? data.slice(0, 2) : null
      });

      // Store raw profiles for debugging
      if (data && data.length > 0) {
        setRawProfiles(data);
        toast.success(`Found ${data.length} profiles in the database`);
      }
      
      if (profilesError) {
        setError(`Database access error: ${profilesError.message} (Code: ${profilesError.code})`);
      } else if (!data || data.length === 0) {
        setError("No profiles found in database. Database returned empty result (not a permission error).");
      } else {
        setError(`Successfully fetched ${data.length} profiles directly. Auth/RLS is working.`);
      }
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
      setError(`Error checking database access: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // For emergency display of profiles directly from the database
  const displayRawProfiles = () => {
    toast.info("Displaying profiles directly from database");
    setShowDebug(true);
  };
  
  const compareRawAndTransformed = () => {
    if (rawProfiles.length > 0 && filteredMembers.length > 0) {
      const comparison = {
        rawCount: rawProfiles.length,
        transformedCount: filteredMembers.length,
        rawSample: rawProfiles.slice(0, 2),
        transformedSample: filteredMembers.slice(0, 2),
        missingIds: rawProfiles
          .filter(raw => !filteredMembers.some(member => member.id === raw.id))
          .map(p => `${p.id} (${p.first_name} ${p.last_name})`)
      };
      
      setDebugInfo(prev => ({ ...prev, comparison }));
      setShowDebug(true);
      toast.info(`Comparison complete: ${rawProfiles.length} raw profiles vs ${filteredMembers.length} transformed members`);
    } else {
      toast.error("Can't compare: Need both raw profiles and transformed members");
    }
  };

  console.log('MembersSection rendered with:', { 
    membersCount: filteredMembers.length, 
    totalMembers, 
    isLoading, 
    hasError: !!error,
    errorMessage: error,
    rawProfilesCount: rawProfiles.length
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Card className="flex-grow">
          <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-medium">Total Members</CardTitle>
              <CardDescription>Active group members</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 p-2">
                <Search className="h-5 w-5 text-green-600" />
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
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="w-full py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading members</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkDatabaseAccess}
                disabled={refreshing}
                className="flex items-center gap-1"
              >
                <Database className={`h-4 w-4 ${refreshing ? 'animate-pulse' : ''}`} />
                Check Database Access
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={displayRawProfiles}
              >
                Display Raw Profiles
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={compareRawAndTransformed}
                disabled={rawProfiles.length === 0 || filteredMembers.length === 0}
                className="bg-amber-50"
              >
                Compare Raw vs. Transformed
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
            
            {showDebug && debugInfo && (
              <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}

            {showDebug && rawProfiles.length > 0 && (
              <div className="mt-4 space-y-4">
                <h4 className="font-medium">Raw Profiles from Database ({rawProfiles.length}):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rawProfiles.map((profile) => (
                    <Card key={profile.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{profile.first_name} {profile.last_name}</CardTitle>
                        <CardDescription>{profile.business_name || 'No business'}</CardDescription>
                      </CardHeader>
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground">ID: {profile.id}</p>
                        <p className="text-sm text-muted-foreground">Email: {profile.email || 'No email'}</p>
                        <p className="text-sm text-muted-foreground">Industry: {profile.industry || 'No industry'}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && filteredMembers.length === 0 && totalMembers === 0 && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No members found</AlertTitle>
          <AlertDescription>
            {searchTerm ? 
              "No members match your search criteria. Try adjusting your search terms." : 
              "There are no members in the directory yet. If you believe this is an error, please contact the administrator."}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && filteredMembers.length === 0 && totalMembers > 0 && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No matching results</AlertTitle>
          <AlertDescription>
            No members match your search criteria. Try adjusting your search terms.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && filteredMembers.length > 0 && (
        <>
          <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Members loaded successfully</AlertTitle>
            <AlertDescription>
              Showing {filteredMembers.length} of {totalMembers} total members.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onClick={() => onSelectMember(member)}
                showEditButton={isAdmin}
                onEdit={() => onEditMember(member)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};
