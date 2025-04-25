
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => Promise<void>;
}

// Define a type for the profile data from Supabase
interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  business_name?: string;
  industry?: string;
  bio?: string;
  profile_picture?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  instagram?: string;
  created_at?: string;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  roles: [],
  isAdmin: false,
  login: async () => {},
  logout: () => {},
  updateCurrentUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);

  // Fetch roles from the Supabase user_roles table
  const fetchRoles = async (userId: string) => {
    try {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
        return [];
      }

      const roleList = rolesData?.map(row => row.role) || [];
      setRoles(roleList);
      return roleList;
    } catch (error) {
      console.error('Error in fetchRoles:', error);
      setRoles([]);
      return [];
    }
  };

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
          
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      return profileData as ProfileData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize authentication state from local storage and refresh profile data
  useEffect(() => {
    const refreshUserData = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User;
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          if (user.id) {
            fetchRoles(user.id);
            
            // Refresh profile data to ensure it's current
            const freshProfileData = await fetchUserProfile(user.id);
            if (freshProfileData) {
              const updatedUser: User = {
                ...user,
                firstName: freshProfileData.first_name || user.firstName,
                lastName: freshProfileData.last_name || user.lastName,
                email: freshProfileData.email || user.email,
                phoneNumber: freshProfileData.phone_number || user.phoneNumber,
                businessName: freshProfileData.business_name || user.businessName,
                industry: freshProfileData.industry || user.industry,
                bio: freshProfileData.bio || user.bio,
                profilePicture: freshProfileData.profile_picture || user.profilePicture,
                website: freshProfileData.website || user.website,
                linkedin: freshProfileData.linkedin || user.linkedin,
                facebook: freshProfileData.facebook || user.facebook,
                tiktok: freshProfileData.tiktok || user.tiktok,
                instagram: freshProfileData.instagram || user.instagram,
              };
              
              setCurrentUser(updatedUser);
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
        }
      }
      setIsLoading(false);
    };

    refreshUserData();
  }, []);

  // Handle login with Supabase authentication
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('Failed to fetch user profile');
        }
        
        // Get user roles
        const userRoles = await fetchRoles(data.user.id);
        const isAdmin = userRoles.includes('admin');
        
        // Correctly type the profile data
        const profile = (profileData as ProfileData) || {};
        
        // Combine auth and profile data
        const newUser: User = {
          id: data.user.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || data.user.email || '',
          phoneNumber: profile.phone_number || '',
          businessName: profile.business_name || '',
          industry: profile.industry || '',
          bio: profile.bio || '',
          profilePicture: profile.profile_picture || '',
          tags: [], // We'll fetch tags separately
          isAdmin,
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          facebook: profile.facebook || '',
          tiktok: profile.tiktok || '',
          instagram: profile.instagram || '',
          createdAt: new Date(profile.created_at || data.user.created_at),
        };
        
        // Fetch member tags
        try {
          const { data: tagsData } = await supabase
            .from('member_tags')
            .select('tag')
            .eq('member_id', data.user.id);
            
          if (tagsData && tagsData.length > 0) {
            newUser.tags = tagsData.map(t => t.tag);
          }
        } catch (tagError) {
          console.error('Error fetching member tags:', tagError);
        }
        
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setRoles([]);
    localStorage.removeItem('currentUser');
    supabase.auth.signOut();
  };

  const updateCurrentUser = async (user: User) => {
    console.log("Updating current user in context:", user);
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.id) {
      await fetchRoles(user.id);
    }
    return Promise.resolve();
  };

  // Infer admin from roles
  const isAdmin = roles.includes('admin');

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, roles, isAdmin, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
