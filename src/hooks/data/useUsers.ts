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
  const [rawProfileData, setRawProfileData] = useState<any[]>([]);

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

      // Simplified direct query for profiles
      const { data: profilesData, error: profilesError, status: profilesStatus } = await supabase
        .from('profiles')
        .select('*');
      
      // Store raw profile data for debugging
      setRawProfileData(profilesData || []);
      
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

      // Fetch user roles (for identifying admins)
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (userRolesError) {
        console.warn('Failed to fetch user roles:', userRolesError.message);
      }

      // Create a map of admin user IDs
      const adminUserIds = userRolesData
        ?.filter(role => role.role === 'admin')
        .map(role => role.user_id) || [];

      // Fetch member tags
      const memberIds = profilesData.map(p => p.id);
      
      const { data: memberTagsData, error: memberTagsError } = await supabase
        .from('member_tags')
        .select('*')
        .in('member_id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000']);
      
      if (memberTagsError) {
        console.warn('Failed to fetch member tags:', memberTagsError.message);
      }

      // Create a map of member tags
      const memberTagsMap = new Map();
      memberTagsData?.forEach(tagObj => {
        if (!memberTagsMap.has(tagObj.member_id)) {
          memberTagsMap.set(tagObj.member_id, []);
        }
        memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
      });

      // Transform profiles into user objects with extra debug logging
      const transformedUsers: User[] = [];
      
      profilesData.forEach(profile => {
        try {
          // Debug log for each profile
          console.log(`Processing profile ${profile.id}: ${profile.first_name} ${profile.last_name}`);
          
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
            createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
          };
          
          transformedUsers.push(user);
        } catch (err) {
          console.error(`Error transforming profile ${profile.id}:`, err);
        }
      });

      console.log('Transformed user objects:', transformedUsers.length);
      
      if (transformedUsers.length === 0 && profilesData.length > 0) {
        console.error('Failed to transform any profiles to users despite having profile data');
        setLoadError('Error processing profile data. Contact administrator.');
      }

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

  // Add method to get raw profile data for debugging
  const getRawProfileData = useCallback(() => {
    return rawProfileData;
  }, [rawProfileData]);

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
    lastRequestDetails,
    getRawProfileData,
    rawProfileData
  };
};
