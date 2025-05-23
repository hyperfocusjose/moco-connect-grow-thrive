
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

export const AuthDebug: React.FC = () => {
  const { currentUser, isAuthenticated, refreshSession, getAuthStatus } = useAuth();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const { isAuthenticated: authContextAuth, sessionValid } = getAuthStatus();
  
  // Show the panel by default if there are auth issues
  useEffect(() => {
    // Check for authentication issues when component mounts
    const checkAuthIssues = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSupabaseSession = !!data.session;
      
      // Automatically expand the panel if there's an auth mismatch
      if (hasSupabaseSession !== authContextAuth || hasSupabaseSession !== sessionValid) {
        setExpanded(true);
      }
      
      setSupabaseSession(data.session);
    };

    checkAuthIssues();
    
    // Re-check every 60 seconds
    const interval = setInterval(checkAuthIssues, 60000);
    
    return () => clearInterval(interval);
  }, [authContextAuth, sessionValid]);

  useEffect(() => {
    const checkSupabaseSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSupabaseSession(data.session);
    };

    checkSupabaseSession();
  }, []);

  const handleRefreshSession = async () => {
    toast.info("Refreshing session...");
    const success = await refreshSession();
    if (success) {
      toast.success("Session refreshed successfully");
      const { data } = await supabase.auth.getSession();
      setSupabaseSession(data.session);
    } else {
      toast.error("Failed to refresh session");
    }
  };

  const handleCheckRLS = async () => {
    toast.info("Testing RLS access...");
    
    try {
      // Try to insert a test record into a table with RLS
      const { error } = await supabase.from('referrals').insert({
        id: crypto.randomUUID(),
        from_member_id: currentUser?.id,
        from_member_name: `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
        to_member_id: currentUser?.id,
        to_member_name: `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
        description: "RLS test record - safe to delete",
        date: new Date().toISOString(),
      }).select();

      if (error) {
        console.error("RLS test failed:", error);
        toast.error(`RLS test failed: ${error.message}`);
      } else {
        toast.success("RLS access confirmed - record created successfully");
      }
    } catch (error) {
      console.error("RLS test error:", error);
      toast.error(`RLS test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const sessionExists = !!supabaseSession;
  const hasAuthIssue = (sessionExists && !authContextAuth) || (authContextAuth && !sessionValid) || (sessionExists && !sessionValid);

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setExpanded(true)} 
          className={hasAuthIssue ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}
        >
          {hasAuthIssue && <AlertTriangle className="mr-1 h-4 w-4" />}
          Debug Auth
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border shadow-lg p-4 rounded-lg w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Auth Debug Panel</h3>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>×</Button>
      </div>

      {hasAuthIssue && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-sm">
          <div className="font-bold flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4" /> 
            Authentication Issue Detected
          </div>
          <p className="mt-1">There's a mismatch between your Supabase session and the app's auth state.</p>
        </div>
      )}

      <div className="space-y-2 text-sm mb-4">
        <div className="grid grid-cols-2 gap-1">
          <span className="font-semibold">Context Auth:</span>
          <span className={authContextAuth ? "text-green-600" : "text-red-600"}>
            {authContextAuth ? "Authenticated" : "Not Authenticated"}
          </span>
          
          <span className="font-semibold">Valid Session:</span>
          <span className={sessionValid ? "text-green-600" : "text-red-600"}>
            {sessionValid ? "Valid" : "Invalid"}
          </span>
          
          <span className="font-semibold">Supabase Session:</span>
          <span className={sessionExists ? "text-green-600" : "text-red-600"}>
            {sessionExists ? "Exists" : "None"}
          </span>
          
          <span className="font-semibold">User ID:</span>
          <span className="break-all">{currentUser?.id || "None"}</span>
          
          <span className="font-semibold">User Name:</span>
          <span>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "None"}</span>
          
          <span className="font-semibold">Is Admin:</span>
          <span>{currentUser?.isAdmin ? "Yes" : "No"}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button size="sm" onClick={handleRefreshSession}>
          Refresh Session
        </Button>
        <Button size="sm" onClick={handleCheckRLS} disabled={!currentUser}>
          Test RLS Access
        </Button>
      </div>
    </div>
  );
};
