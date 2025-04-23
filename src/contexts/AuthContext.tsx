
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
      // For demo users with non-UUID IDs, we'll return hardcoded roles
      if (userId === 'user-1') {
        const adminRoles = ['admin'];
        setRoles(adminRoles);
        return adminRoles;
      } else if (userId === 'user-2') {
        const userRoles = ['user'];
        setRoles(userRoles);
        return userRoles;
      }
      
      // For real Supabase users with proper UUIDs
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

  // login only sets basic user info, then loads roles from Supabase
  const login = async (email: string, password: string) => {
    // DEMO: hardcoded user objects as previously
    let user: User | null = null;

    if (email === 'admin@mocopng.com') {
      user = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'admin@mocopng.com',
        phoneNumber: '123-456-7890',
        businessName: 'Doe Consulting',
        industry: 'Consulting',
        bio: 'Experienced consultant specializing in business strategy.',
        tags: ['strategy', 'management', 'leadership'],
        profilePicture: '/images/avatars/avatar-1.png',
        isAdmin: false, // ignore this, infer from roles
        website: 'https://www.example.com',
        linkedin: 'john.doe',
        facebook: 'johndoe',
        tiktok: '@johndoe',
        instagram: 'johndoe',
        createdAt: new Date(),
      };
      
      // No need to interact with Supabase for demo users
      // We'll handle this in fetchRoles instead
    } else if (email === 'plumber@example.com') {
      user = {
        id: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'plumber@example.com',
        phoneNumber: '987-654-3210',
        businessName: 'Smith Plumbing',
        industry: 'Home Services',
        bio: 'Professional plumber with over 10 years of experience.',
        tags: ['plumbing', 'home repair', 'local business'],
        profilePicture: '/images/avatars/avatar-2.png',
        isAdmin: false,
        website: 'https://www.example.com',
        linkedin: 'janesmith',
        facebook: 'janesmith',
        tiktok: '@janesmith',
        instagram: 'janesmith',
        createdAt: new Date(),
      };
      
      // No need to interact with Supabase for demo users
      // We'll handle this in fetchRoles instead
    } else {
      throw new Error('Invalid email or password');
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));

    if (user.id) {
      await fetchRoles(user.id);
    }
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
