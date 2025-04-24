
import { useState, useCallback } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        console.log('No user profiles found');
        return;
      }

      // Fetch user roles separately
      const userRolesMap = new Map();
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (!userRolesError && userRolesData) {
        userRolesData.forEach((role) => {
          userRolesMap.set(role.user_id, role.role);
        });
      }

      // Fetch member tags separately
      const memberTagsMap = new Map();
      const { data: memberTagsData, error: memberTagsError } = await supabase
        .from('member_tags')
        .select('*');

      if (!memberTagsError && memberTagsData) {
        memberTagsData.forEach((tagObj) => {
          if (!memberTagsMap.has(tagObj.member_id)) {
            memberTagsMap.set(tagObj.member_id, []);
          }
          memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
        });
      }

      // Transform and filter out admin users
      const transformedUsers: User[] = profilesData
        .filter(profile => {
          const hasNames = profile.first_name && profile.last_name;
          const isAdmin = userRolesMap.get(profile.id) === 'admin';
          console.log(`User ${profile.first_name}: hasNames=${hasNames}, isAdmin=${isAdmin}`);
          return hasNames && !isAdmin;
        })
        .map(profile => ({
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
          isAdmin: userRolesMap.get(profile.id) === 'admin',
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          facebook: profile.facebook || '',
          tiktok: profile.tiktok || '',
          instagram: profile.instagram || '',
          createdAt: new Date(profile.created_at),
        }));
      
      console.log('Transformed users:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    }
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
        
        const tagInserts = updatedUserData.tags.map(tag => ({
          member_id: id,
          tag: tag
        }));
        
        if (tagInserts.length > 0) {
          const { error: insertError } = await supabase
            .from('member_tags')
            .insert(tagInserts);
          
          if (insertError) throw insertError;
        }
      }
      
      setUsers(prev => 
        prev.map(user => user.id === id ? { ...user, ...updatedUserData } : user)
      );
      
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
    getUser,
    addUser,
    updateUser,
    fetchUsers
  };
};
