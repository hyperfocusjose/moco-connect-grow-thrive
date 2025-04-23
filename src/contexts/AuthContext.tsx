import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  updateCurrentUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (email === 'admin@mocopng.com') {
        const adminUser = {
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
          isAdmin: true,
          website: 'https://www.example.com',
          linkedin: 'john.doe',
          facebook: 'johndoe',
          tiktok: '@johndoe',
          instagram: 'johndoe',
          createdAt: new Date(),
        };
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
      } else if (email === 'plumber@example.com') {
        const regularUser = {
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
        setCurrentUser(regularUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(regularUser));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const updateCurrentUser = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
