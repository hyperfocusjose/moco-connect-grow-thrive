import { useState, useCallback, useRef } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Define a type for profiles table rows
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchUsers = useCallback(async () => {
    if (isLoading) return false;

    const now = Date.now();
    const cooldownPeriod = 5000;
    if (now - lastFetchTimeRef.current < cooldownPeriod) {
      console.log('Users fetch cooldown active, skipping request');
      return false;
    }

    fetchAttemptRef.current += 1;
    const maxRetries = 3;
    if (fetchAttemptRef.current > maxRetries) {
      if (fetchAttemptRef.current === maxRetries + 1) {
        setLoadError('Too many failed attempts to load users. Please try again later.');
        toast.error('Users could not be loaded', {
          description: 'Check your network connection and try again later.',
          id: 'users-load-error'
        });
      }
      console.warn(`Users fetch exceeded ${maxRetries} attempts, stopping`);
      return false;
    }

    if (fetchAttemptRef.current === 1) {
      setIsLoading(true);
    }

    lastFetchTimeRef.current = now;

    try {
      console.log('Fetching users...');

      const adminUserId = '31727ff4-213c-492a-bbc6-ce91c8bab2d2';

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (!isMountedRef.current) return false;

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        setLoadError(userRolesError.message);
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load user data', { id: 'users-load-error' });
        }
        return false;
      }

      const adminUserIds = userRolesData
        ?.filter(role => role.role === 'admin')
        .map(role => role.user_id) || [];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', adminUserId);

      if (!isMountedRef.current) return false;

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        setLoadError(profilesError.message);
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load user profiles', { id: 'users-load-error' });
        }
        return false;
      }

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        setLoadError(null);
        fetchAttemptRef.current = 0;
        return true;
      }

      const memberIds = profilesData.map(p => p.id);
      const { data: memberTagsData, error: memberTagsError } = await supabase
        .from('member_tags')
        .select('*')
        .in('member_id', memberIds);

      if (!isMountedRef.current) return false;

      if (memberTagsError) {
        console.error('Error fetching member tags:', memberTagsError);
      }

      const memberTagsMap = new Map();
      memberTagsData?.forEach(tagObj => {
        if (!memberTagsMap.has(tagObj.member_id)) {
          memberTagsMap.set(tagObj.member_id, []);
        }
        memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
      });

      const transformedUsers: User[] = profilesData.map(profile => ({
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
      }));

      setUsers(transformedUsers);
      setLoadError(null);
      fetchAttemptRef.current = 0;
      return true;
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      if (fetchAttemptRef.current === 1) {
        toast.error('Failed to load users', { id: 'users-load-error' });
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  const resetFetchState = useCallback(() => {
    fetchAttemptRef.current = 0;
    setLoadError(null);
    lastFetchTimeRef.current = 0;
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
        const { error: deleteError } = await supabase
          .from('member_tags')
          .delete()
          .eq('member_id', id);
        if (deleteError) throw deleteError;

        const tagInserts = updatedUserData.tags.map(tag => ({ member_id: id, tag }));
        if (tagInserts.length > 0) {
          const { error: insertError } = await supabase
            .from('member_tags')
            .insert(tagInserts);
          if (insertError) throw insertError;
        }
      }

      await fetchUsers();
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return Promise.reject(error);
    }
  };

  return {
    users,
    isLoading,
    loadError,
    getUser,
    addUser,
    updateUser,
    fetchUsers,
    resetFetchState,
    cleanup
  };
};