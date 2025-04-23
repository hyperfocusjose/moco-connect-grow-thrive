
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

  // Fetch roles from Supabase user_roles table
  const fetchRoles = async (userId: string) => {
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

  // Expect real Supabase-based login ONLY, no demo users.
  const login = async (email: string, password: string) => {
    throw new Error('Login with demo users is disabled. Please use Supabase authentication.');
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setRoles([]);
    localStorage.removeItem('currentUser');
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
