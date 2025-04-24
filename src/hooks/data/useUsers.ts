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

      // Fetch user roles and convert IDs to strings for consistent comparison
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
      }

      // Create a Set of admin user IDs as strings for consistent comparison
      const adminUserIds = new Set(
        userRolesData
          ?.filter(role => role.role === 'admin')
          .map(role => String(role.user_id))
      );

      console.log('Admin user IDs:', Array.from(adminUserIds));

      // Fetch member tags
      const { data: memberTagsData, error: memberTagsError } = await supabase
        .from('member_tags')
        .select('*');

      if (memberTagsError) {
        console.error('Error fetching member tags:', memberTagsError);
      }

      // Create tags map
      const memberTagsMap = new Map();
      memberTagsData?.forEach((tagObj) => {
        if (!memberTagsMap.has(tagObj.member_id)) {
          memberTagsMap.set(tagObj.member_id, []);
        }
        memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
      });

      // Transform profiles and ensure consistent ID comparison when filtering admins
      const transformedUsers: User[] = profilesData
        .filter(profile => {
          const isAdmin = adminUserIds.has(String(profile.id));
          console.log(`Filtering user ${profile.first_name} (${profile.id}): isAdmin=${isAdmin}`);
          return !isAdmin; // Filter out admin users
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
          isAdmin: false, // We know these aren't admins because we filtered them out
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
      console.log('Updating user with data:', { id, ...updatedUserData });
      
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
