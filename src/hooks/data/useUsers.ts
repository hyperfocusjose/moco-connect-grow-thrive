import { useState, useCallback, useEffect, useRef } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [lastRequestDetails, setLastRequestDetails] = useState<any>(null);

  const fetchUsers = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadError(null);
    setAuthError(null);
    setFetchAttempted(true);
    console.log('fetchUsers: Starting to fetch users');

    try {
      // First check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      const sessionDetails = {
        hasSession: !!sessionData.session,
        sessionExpiry: sessionData.session ? new Date(sessionData.session.expires_at * 1000).toISOString() : 'No session',
        currentTime: new Date().toISOString(),
      };
      
      setLastRequestDetails(prevState => ({ ...prevState, sessionDetails }));
      
      if (sessionError) {
        console.error('Session error:', sessionError.message);
        const errMsg = `Authentication error: ${sessionError.message}`;
        setLastRequestDetails(prevState => ({ 
          ...prevState, 
          error: errMsg 
        }));
        throw new Error(errMsg);
      }
      
      if (!sessionData.session) {
        const authErr = 'No valid authentication session found';
        console.error(authErr);
        setAuthError(authErr);
        setLastRequestDetails(prevState => ({ 
          ...prevState, 
          error: authErr 
        }));
        throw new Error(authErr);
      }

      console.log('Session valid, token expiry:', new Date(sessionData.session.expires_at * 1000).toISOString());

      // Admin user ID to exclude from results
      const adminUserId = '31727ff4-213c-492a-bbc6-ce91c8bab2d2';

      // Fetch user roles
      console.log('Fetching user roles...');
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      setLastRequestDetails(prevState => ({ 
        ...prevState, 
        userRolesQuery: {
          success: !userRolesError,
          error: userRolesError?.message || null,
          count: userRolesData?.length || 0
        }
      }));

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError.message);
        if (userRolesError.message.includes('Row level security')) {
          setAuthError('Authentication issue: Unable to access user roles due to security policies');
          throw new Error(`Row level security error: ${userRolesError.message}`);
        }
        throw new Error(userRolesError.message);
      }
      
      console.log('fetchUsers: Fetched user roles:', userRolesData?.length || 0);

      const adminUserIds = userRolesData
        ?.filter(role => role.role === 'admin')
        .map(role => role.user_id) || [];

      // Add more detailed debugging for profiles query
      console.log('fetchUsers: About to fetch profiles');
      
      // Explicitly log the request details before making it
      console.log('Profiles request details:', {
        method: 'GET',
        table: 'profiles',
        filter: `neq(id, ${adminUserId})`,
        auth: 'Using authenticated session token'
      });
      
      // Modified direct query to simplify for debugging
      const { data: profilesData, error: profilesError, status: profilesStatus } = await supabase
        .from('profiles')
        .select('*');
      
      setLastRequestDetails(prevState => ({ 
        ...prevState, 
        profilesQuery: {
          timestamp: new Date().toISOString(),
          status: profilesStatus,
          error: profilesError?.message || null,
          errorCode: profilesError?.code || null,
          count: profilesData?.length || 0,
          sample: profilesData?.slice(0, 1) || []
        }
      }));

      // Log the status code from the response
      console.log('Profiles request status code:', profilesStatus);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError.message, 'Status code:', profilesStatus);
        if (profilesError.message.includes('Row level security')) {
          setAuthError('Authentication issue: Unable to access profiles due to security policies');
          throw new Error(`Row level security error: ${profilesError.message}`);
        }
        throw new Error(profilesError.message);
      }
      
      console.log('fetchUsers: Fetched profiles:', profilesData?.length || 0, 
        profilesData && profilesData.length > 0 
          ? { "sample": profilesData.slice(0, 2) }
          : { "notes": "No profiles found" }
      );

      if (!profilesData || profilesData.length === 0) {
        console.warn('No profiles found in the database');
        setUsers([]);
        setLoadError('No profiles found in the database');
        return;
      }

      const memberIds = profilesData.map(p => p.id);

      const { data: memberTagsData, error: memberTagsError } = await supabase
        .from('member_tags')
        .select('*')
        .in('member_id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000']);
      
      setLastRequestDetails(prevState => ({ 
        ...prevState, 
        memberTagsQuery: {
          success: !memberTagsError,
          error: memberTagsError?.message || null,
          count: memberTagsData?.length || 0
        }
      }));

      if (memberTagsError) {
        console.warn('Failed to fetch member tags:', memberTagsError.message);
      }
      
      console.log('fetchUsers: Fetched member tags:', memberTagsData?.length || 0);

      const memberTagsMap = new Map();
      memberTagsData?.forEach(tagObj => {
        if (!memberTagsMap.has(tagObj.member_id)) {
          memberTagsMap.set(tagObj.member_id, []);
        }
        memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
      });

      const transformedUsers: User[] = profilesData.map(profile => {
        const user: User = {
          id: profile.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          phoneNumber: profile.phone_number || '',
          businessName: profile.business_name || '',
          industry: profile.industry || '',
          bio: profile.bio || '',
          tags: memberTagsMap.get(profile.id) || [],
          profilePicture: profile.profile_picture || '',
          isAdmin: adminUserIds.includes(profile.id),
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          facebook: profile.facebook || '',
          tiktok: profile.tiktok || '',
          instagram: profile.instagram || '',
          createdAt: new Date(profile.created_at),
        };
        return user;
      });

      if (isMountedRef.current) {
        console.log('fetchUsers: Setting users state with:', transformedUsers.length);
        setUsers(transformedUsers);
        setLoadError(null);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (isMountedRef.current) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setLoadError(errorMsg);
        if (!authError && errorMsg.includes('auth')) {
          setAuthError(errorMsg);
        }
        toast.error(authError || 'Failed to load users');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      console.log('fetchUsers: Completed');
    }
  }, [isLoading, authError]);

  useEffect(() => {
    console.log('useUsers: Initial mount, fetching users');
    fetchUsers();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchUsers]);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  const resetFetchState = useCallback(() => {
    setLoadError(null);
    setAuthError(null);
  }, []);

  const getUser = useCallback((userId: string | undefined) => {
    if (!userId) return undefined;
    return users.find(user => user.id === userId);
  }, [users]);

  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    return Promise.resolve();
  };

  const updateUser = async (id: string, updatedUserData: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updatedUserData.firstName,
          last_name: updatedUserData.lastName,
          phone_number: updatedUserData.phoneNumber,
          business_name: updatedUserData.businessName,
          industry: updatedUserData.industry,
          bio: updatedUserData.bio,
          profile_picture: updatedUserData.profilePicture,
          website: updatedUserData.website,
          linkedin: updatedUserData.linkedin,
          facebook: updatedUserData.facebook,
          tiktok: updatedUserData.tiktok,
          instagram: updatedUserData.instagram,
        })
        .eq('id', id);

      if (error) throw error;

      if (updatedUserData.tags) {
        await supabase.from('member_tags').delete().eq('member_id', id);
        const tagInserts = updatedUserData.tags.map(tag => ({
          member_id: id,
          tag,
        }));
        if (tagInserts.length > 0) {
          await supabase.from('member_tags').insert(tagInserts);
        }
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...updatedUserData } : user
      ));
      
      toast.success('User profile updated');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return Promise.reject(error);
    }
  };

  // Added new method to get last request details
  const getLastRequestDetails = useCallback(() => {
    return lastRequestDetails;
  }, [lastRequestDetails]);

  return {
    users,
    isLoading,
    loadError,
    authError,
    fetchAttempted,
    getUser,
    addUser,
    updateUser,
    fetchUsers,
    resetFetchState,
    cleanup,
    getLastRequestDetails,
    lastRequestDetails
  };
};
