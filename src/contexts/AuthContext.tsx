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

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setIsLoading(false);
            return;
          }
          
          const userRoles = await fetchRoles(sessionData.session.user.id);
          const isAdmin = userRoles.includes('admin');
          
          const user: User = {
            id: sessionData.session.user.id,
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || sessionData.session.user.email || '',
            phoneNumber: profileData.phone_number || '',
            businessName: profileData.business_name || '',
            industry: profileData.industry || '',
            bio: profileData.bio || '',
            profilePicture: profileData.profile_picture || '',
            tags: [],
            isAdmin,
            website: profileData.website || '',
            linkedin: profileData.linkedin || '',
            facebook: profileData.facebook || '',
            tiktok: profileData.tiktok || '',
            instagram: profileData.instagram || '',
            createdAt: new Date(profileData.created_at || sessionData.session.user.created_at),
          };
          
          try {
            const { data: tagsData } = await supabase
              .from('member_tags')
              .select('tag')
              .eq('member_id', sessionData.session.user.id);
              
            if (tagsData && tagsData.length > 0) {
              user.tags = tagsData.map(t => t.tag);
            }
          } catch (tagError) {
            console.error('Error fetching member tags:', tagError);
          }
          
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          setIsAuthenticated(true);
        } else {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              setCurrentUser(user);
              setIsAuthenticated(true);
              if (user.id) {
                fetchRoles(user.id);
              }
            } catch (error) {
              console.error('Failed to parse stored user data:', error);
              localStorage.removeItem('currentUser');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

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
        
        const userRoles = await fetchRoles(data.user.id);
        const isAdmin = userRoles.includes('admin');
        
        const profile = (profileData as ProfileData) || {};
        
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
          tags: [],
          isAdmin,
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          facebook: profile.facebook || '',
          tiktok: profile.tiktok || '',
          instagram: profile.instagram || '',
          createdAt: new Date(profile.created_at || data.user.created_at),
        };
        
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
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.id) {
      await fetchRoles(user.id);
    }
    return Promise.resolve();
  };

  const isAdmin = roles.includes('admin');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile on auth change:', profileError);
            return;
          }
          
          const userRoles = await fetchRoles(session.user.id);
          const isAdmin = userRoles.includes('admin');
          
          const updatedUser: User = {
            id: session.user.id,
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || session.user.email || '',
            phoneNumber: profileData.phone_number || '',
            businessName: profileData.business_name || '',
            industry: profileData.industry || '',
            bio: profileData.bio || '',
            profilePicture: profileData.profile_picture || '',
            tags: [],
            isAdmin,
            website: profileData.website || '',
            linkedin: profileData.linkedin || '',
            facebook: profileData.facebook || '',
            tiktok: profileData.tiktok || '',
            instagram: profileData.instagram || '',
            createdAt: new Date(profileData.created_at || session.user.created_at),
          };
          
          try {
            const { data: tagsData } = await supabase
              .from('member_tags')
              .select('tag')
              .eq('member_id', session.user.id);
              
            if (tagsData && tagsData.length > 0) {
              updatedUser.tags = tagsData.map(t => t.tag);
            }
          } catch (tagError) {
            console.error('Error fetching member tags:', tagError);
          }
          
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setRoles([]);
          localStorage.removeItem('currentUser');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, roles, isAdmin, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
