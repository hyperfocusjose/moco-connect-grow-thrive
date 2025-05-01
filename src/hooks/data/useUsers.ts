
import { useState, useCallback } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Define a type for profiles table rows
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users...');
      
      // First get all user_roles to identify admin users
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        return;
      }

      // Get the admin user ID
      const adminUserIds = userRolesData
        ?.filter(role => role.role === 'admin')
        .map(role => role.user_id) || [];
      
      const adminUserId = adminUserIds.length > 0 ? adminUserIds[0] : null;
      
      console.log('Admin user ID:', adminUserId);
        console.log("adminUserId used for filtering:", adminUserId);
      console.log("Returned profiles:", profilesData);
      
      // Now fetch profiles directly excluding the admin user ID
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', adminUserId || '31727ff4-213c-492a-bbc6-ce91c8bab2d2'); 
      
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        console.log('No user profiles found');
        return;
      }

      // Fetch member tags separately
      const { data: memberTagsData, error: memberTagsError } = await supabase
        .from('member_tags')
        .select('*');

      if (memberTagsError) {
        console.error('Error fetching member tags:', memberTagsError);
      }

      const memberTagsMap = new Map();
      memberTagsData?.forEach((tagObj) => {
        if (!memberTagsMap.has(tagObj.member_id)) {
          memberTagsMap.set(tagObj.member_id, []);
        }
        memberTagsMap.get(tagObj.member_id).push(tagObj.tag);
      });

      // Transform profiles - we've excluded admin users in the query
      const transformedUsers: User[] = profilesData.map(profile => {
        return {
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
          isAdmin: adminUserIds.includes(profile.id), // Still tracking isAdmin for other features
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          facebook: profile.facebook || '',
          tiktok: profile.tiktok || '',
          instagram: profile.instagram || '',
          createdAt: new Date(profile.created_at),
        };
      });
      
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
