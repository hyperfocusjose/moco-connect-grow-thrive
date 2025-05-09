
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

  const fetchUsers = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadError(null);
    setAuthError(null);
    console.log('fetchUsers: Starting to fetch users');

    try {
      // First check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!sessionData.session) {
        const authErr = 'No valid authentication session found';
        setAuthError(authErr);
        throw new Error(authErr);
      }

      const adminUserId = '31727ff4-213c-492a-bbc6-ce91c8bab2d2';

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

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
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', adminUserId);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError.message);
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

  return {
    users,
    isLoading,
    loadError,
    authError,
    getUser,
    addUser,
    updateUser,
    fetchUsers,
    resetFetchState,
    cleanup,
  };
};
