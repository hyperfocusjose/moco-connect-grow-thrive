
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for development
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@mocopng.com',
    firstName: 'Admin',
    lastName: 'User',
    businessName: 'MocoPNG Administration',
    phoneNumber: '555-123-4567',
    profilePicture: '/placeholder.svg',
    industry: 'Administration',
    bio: 'Group administrator',
    tags: ['admin', 'management'],
    isAdmin: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'plumber@example.com',
    firstName: 'John',
    lastName: 'Smith',
    businessName: 'Smith Plumbing',
    phoneNumber: '555-987-6543',
    profilePicture: '/placeholder.svg',
    industry: 'Plumbing',
    bio: 'Professional plumbing services with 15 years of experience',
    tags: ['plumbing', 'repairs', 'installation'],
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'realtor@example.com',
    firstName: 'Elizabeth',
    lastName: 'Johnson',
    businessName: 'Johnson Realty',
    phoneNumber: '555-456-7890',
    profilePicture: '/placeholder.svg',
    industry: 'Real Estate',
    bio: 'Helping families find their dream homes since 2010',
    tags: ['real estate', 'buying', 'selling', 'investments'],
    isAdmin: false,
    createdAt: new Date(),
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('mocopng_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, we would verify the password here
      // For demo purposes, we're just checking the email
      
      setCurrentUser(user);
      localStorage.setItem('mocopng_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === userData.email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        businessName: userData.businessName || '',
        phoneNumber: userData.phoneNumber || '',
        profilePicture: userData.profilePicture || '/placeholder.svg',
        industry: userData.industry || '',
        bio: userData.bio || '',
        tags: userData.tags || [],
        isAdmin: false,
        createdAt: new Date(),
      };
      
      // In a real app, we would store this user in a database
      // For demo, we're just setting the current user
      
      setCurrentUser(newUser);
      localStorage.setItem('mocopng_user', JSON.stringify(newUser));
      
      // In a real app, we would add the user to the database here
      MOCK_USERS.push(newUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('mocopng_user');
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      // Update user
      const updatedUser = { ...currentUser, ...userData };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('mocopng_user', JSON.stringify(updatedUser));
      
      // In a real app, we would update the user in the database here
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
