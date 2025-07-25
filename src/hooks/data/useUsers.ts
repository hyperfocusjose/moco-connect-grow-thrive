
import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Check authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      // Fetch profiles
      const { data: profilesData, error: profilesError, status } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      // Fetch user roles
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('*');

      // Fetch member tags
      const memberIds = profilesData?.map(p => p.id) || [];
      const { data: memberTagsData } = await supabase
        .from('member_tags')
        .select('*')
        .in('member_id', memberIds.length > 0 ? memberIds : ['none']);

      // Create maps for efficient lookup
      const adminUserIds = new Set(
        userRolesData
          ?.filter(role => role.role === 'admin')
          .map(role => role.user_id) || []
      );

      const memberTagsMap = new Map();
      memberTagsData?.forEach(tagObj => {
        if (!memberTagsMap.has(tagObj.member_id)) {
          memberTagsMap.set(tagObj.member_id, []);
        }
        memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
      });

      // Transform profiles to users
      const transformedUsers: User[] = (profilesData || []).map(profile => ({
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
        isAdmin: adminUserIds.has(profile.id),
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        facebook: profile.facebook || '',
        tiktok: profile.tiktok || '',
        instagram: profile.instagram || '',
        createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
      }));

      // Set debug info
      setDebugInfo({
        hasSession: !!sessionData.session,
        sessionExpiry: sessionData.session?.expires_at 
          ? new Date(sessionData.session.expires_at * 1000).toISOString() 
          : 'No session',
        currentTime: new Date().toISOString(),
        profilesQueryStatus: status,
        profilesCount: profilesData?.length || 0,
        profilesError: profilesError?.message || null,
        errorCode: profilesError?.code || null,
        profilesData: profilesData?.slice(0, 2) || [],
        transformedCount: transformedUsers.length
      });

      setUsers(transformedUsers);
      console.log(`Successfully loaded ${transformedUsers.length} users`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLoadError(errorMsg);
      console.error('Error fetching users:', error);
      
      if (!errorMsg.includes('Authentication')) {
        toast.error('Failed to load users');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    getUser,
    addUser,
    updateUser,
    fetchUsers,
    debugInfo,
    resetFetchState: () => setLoadError(null)
  };
};
