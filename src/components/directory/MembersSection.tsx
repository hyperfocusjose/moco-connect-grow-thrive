import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { MemberCard } from '@/components/directory/MemberCard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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

  // Keep persistent error state when loadError changes
  useEffect(() => {
    if (loadError) {
      setError(loadError);
    }
  }, [loadError]);

  // Direct database debug check
  const checkDatabaseAccess = async () => {
    try {
      const { data: authData } = await supabase.auth.getSession();
      
      // Check session validity
      const hasSession = !!authData.session;
      
      // Try direct profiles query
      const { data, error: profilesError, status } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .limit(5);
        
      setDebugInfo({
        hasSession,
        sessionExpiry: authData.session ? new Date(authData.session.expires_at * 1000).toISOString() : 'No session',
        currentTime: new Date().toISOString(),
        profilesQueryStatus: status,
        profilesCount: data?.length || 0,
        profilesError: profilesError?.message || null,
        errorCode: profilesError?.code || null
      });
      
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
    }
  };

  console.log('MembersSection rendered with:', { 
    membersCount: filteredMembers.length, 
    totalMembers, 
    isLoading, 
    hasError: !!error,
    errorMessage: error
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
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkDatabaseAccess}
              >
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
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
            
            {showDebug && debugInfo && (
              <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && filteredMembers.length === 0 && (
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

      {!isLoading && !error && filteredMembers.length > 0 && (
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
      )}
    </>
  );
};
