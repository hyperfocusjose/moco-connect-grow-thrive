
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

  // Modified fetchRoles function that doesn't depend on user_roles table
  // This is a temporary implementation until you create the user_roles table
  const fetchRoles = async (userId: string) => {
    // For now, we'll return an empty array since the table doesn't exist yet
    console.log('Fetching roles for user:', userId);
    // Once you create the user_roles table, you can uncomment this code
    /*
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
        return [];
      }

      const roleList = data?.map((row) => row.role) || [];
      setRoles(roleList);
      return roleList;
    } catch (error) {
      console.error('Error in fetchRoles:', error);
      setRoles([]);
      return [];
    }
    */
    setRoles([]);
    return [];
  };

  useEffect(() => {
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
      }
    }
    setIsLoading(false);
  }, []);

  // Setup Supabase authentication when we implement it
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
        const newUser: User = {
          id: data.user.id,
          firstName: data.user.user_metadata.firstName || '',
          lastName: data.user.user_metadata.lastName || '',
          email: data.user.email || '',
          phoneNumber: data.user.user_metadata.phoneNumber || '',
          businessName: data.user.user_metadata.businessName || '',
          industry: data.user.user_metadata.industry || '',
          tags: data.user.user_metadata.tags || [],
          isAdmin: false, // We'll set this based on roles once implemented
          createdAt: new Date(data.user.created_at),
        };
        
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setIsAuthenticated(true);
        
        if (newUser.id) {
          await fetchRoles(newUser.id);
        }
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

  // Infer admin from roles
  const isAdmin = roles.includes('admin');

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, roles, isAdmin, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
