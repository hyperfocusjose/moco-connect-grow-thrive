
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

  const fetchUsers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const adminUserId = '31727ff4-213c-492a-bbc6-ce91c8bab2d2';

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) throw new Error(userRolesError.message);

      const adminUserIds = userRolesData
        ?.filter(role => role.role === 'admin')
        .map(role => role.user_id) || [];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', adminUserId);

      if (profilesError) throw new Error(profilesError.message);

      const memberIds = profilesData?.map(p => p.id) || [];

      const { data: memberTagsData, error: memberTagsError } = await supabase
        .from('member_tags')
        .select('*')
        .in('member_id', memberIds);

      if (memberTagsError) console.warn('Failed to fetch member tags:', memberTagsError.message);

      const memberTagsMap = new Map();
      memberTagsData?.forEach(tagObj => {
        if (!memberTagsMap.has(tagObj.member_id)) {
          memberTagsMap.set(tagObj.member_id, []);
        }
        memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
      });

      const transformedUsers: User[] = profilesData?.map(profile => ({
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
      })) || [];

      if (isMountedRef.current) {
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load users');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
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

      await fetchUsers();
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
    getUser,
    addUser,
    updateUser,
    fetchUsers,
    resetFetchState,
    cleanup,
  };
};
