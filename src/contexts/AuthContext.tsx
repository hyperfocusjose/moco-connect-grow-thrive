import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  getAuthStatus: () => { isAuthenticated: boolean, sessionValid: boolean };
  sessionValid: boolean;
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
  refreshSession: async () => false,
  getAuthStatus: () => ({ isAuthenticated: false, sessionValid: false }),
  sessionValid: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [sessionValid, setSessionValid] = useState(false);

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
      // Add debug logging to track data access attempts
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
          
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      console.log('Profile data received:', profileData ? 'yes' : 'no');
      return profileData as ProfileData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Refresh the Supabase session and return if the session is valid
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('Refreshing Supabase session');
      
      // Get the current session state from Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        setIsAuthenticated(false);
        setSessionValid(false);
        setCurrentUser(null);
        return false;
      }
      
      // Debug log to track session state
      console.log('Session refreshed, session exists:', !!data.session);
      console.log('Session user:', data.session?.user?.id);
      
      // Update session validity state
      const hasValidSession = !!data.session;
      setSessionValid(hasValidSession);
      
      // If no valid session, clear user state
      if (!hasValidSession) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        return false;
      }
      
      // If we have a valid session, check if we need to update user data
      const userId = data.session.user.id;
      const storedUserJson = localStorage.getItem('currentUser');
      const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
      
      // Only fetch profile if we don't have it or it doesn't match the session user
      if (!storedUser || storedUser.id !== userId) {
        console.log('Fetching full user profile during refresh');
        const profileData = await fetchUserProfile(userId);
        
        if (profileData) {
          const userRoles = await fetchRoles(userId);
          const isAdmin = userRoles.includes('admin');
          
          const newUser: User = {
            id: userId,
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || data.session.user.email || '',
            phoneNumber: profileData.phone_number || '',
            businessName: profileData.business_name || '',
            industry: profileData.industry || '',
            bio: profileData.bio || '',
            profilePicture: profileData.profile_picture || '',
            tags: [], // We'll fetch tags separately if needed
            isAdmin,
            website: profileData.website || '',
            linkedin: profileData.linkedin || '',
            facebook: profileData.facebook || '',
            tiktok: profileData.tiktok || '',
            instagram: profileData.instagram || '',
            createdAt: new Date(profileData.created_at || Date.now()),
          };
          
          setCurrentUser(newUser);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
        } else {
          console.warn('Valid session but profile not found');
        }
      } else if (!isAuthenticated && storedUser) {
        // Restore authentication state
        console.log('Restoring user from localStorage during refresh');
        setCurrentUser(storedUser);
        setIsAuthenticated(true);
        // We already have the stored user, so no need to refetch roles
        // This may help avoid unnecessary database queries
      }
      
      return hasValidSession;
    } catch (error) {
      console.error('Error refreshing session:', error);
      setSessionValid(false);
      return false;
    }
  };
  
  // Get current auth status
  const getAuthStatus = () => {
    return { 
      isAuthenticated,
      sessionValid 
    };
  };

  // Setup auth state listener and initialize session
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // 1. First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, !!session);
            
            if (session) {
              setSessionValid(true);
              
              // On login events, we'll load the full profile
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Use setTimeout to avoid potential deadlocks with Supabase client
                setTimeout(async () => {
                  try {
                    const userId = session.user.id;
                    const profileData = await fetchUserProfile(userId);
                    
                    if (profileData) {
                      const userRoles = await fetchRoles(userId);
                      
                      const newUser: User = {
                        id: userId,
                        firstName: profileData.first_name || '',
                        lastName: profileData.last_name || '',
                        email: profileData.email || session.user.email || '',
                        phoneNumber: profileData.phone_number || '',
                        businessName: profileData.business_name || '',
                        industry: profileData.industry || '',
                        bio: profileData.bio || '',
                        profilePicture: profileData.profile_picture || '',
                        tags: [], // We'll fetch tags separately
                        isAdmin: userRoles.includes('admin'),
                        website: profileData.website || '',
                        linkedin: profileData.linkedin || '',
                        facebook: profileData.facebook || '',
                        tiktok: profileData.tiktok || '',
                        instagram: profileData.instagram || '',
                        createdAt: new Date(profileData.created_at || Date.now()),
                      };
                      
                      setCurrentUser(newUser);
                      setIsAuthenticated(true);
                      localStorage.setItem('currentUser', JSON.stringify(newUser));
                    }
                  } catch (error) {
                    console.error('Error loading user profile after auth change:', error);
                  }
                }, 0);
              }
            } else if (event === 'SIGNED_OUT') {
              setCurrentUser(null);
              setIsAuthenticated(false);
              setSessionValid(false);
              setRoles([]);
              localStorage.removeItem('currentUser');
            }
          }
        );
        
        // 2. Then check for existing session
        await refreshSession();
        
        return () => {
          subscription.unsubscribe();
        };
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle login with Supabase authentication
  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast.error(`Login failed: ${error.message}`);
        throw error;
      }
      
      if (data.user) {
        console.log('Login successful for:', data.user.email);
        
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
        
        console.log('Setting current user:', newUser);
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setIsAuthenticated(true);
        setSessionValid(true);
        
        toast.success(`Welcome back, ${newUser.firstName || 'User'}!`);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setSessionValid(false);
      setRoles([]);
      localStorage.removeItem('currentUser');
      toast.info('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out properly');
    }
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
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      isLoading, 
      roles, 
      isAdmin, 
      login, 
      logout, 
      updateCurrentUser,
      refreshSession,
      getAuthStatus,
      sessionValid
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
