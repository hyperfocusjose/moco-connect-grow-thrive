import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { demoUsers } from '@/data/demoData';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(demoUsers);
      console.log(`Successfully loaded ${demoUsers.length} demo users`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLoadError(errorMsg);
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUser = useCallback((userId: string | undefined) => {
    if (!userId) return undefined;
    return users.find(user => user.id === userId);
  }, [users]);

  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    return Promise.resolve();
  };

  const updateUser = async (id: string, updatedUserData: Partial<User>) => {
    // Update local state
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updatedUserData } : user
    ));
    
    toast.success('User profile updated');
    return Promise.resolve();
  };

  return {
    users,
    isLoading,
    loadError,
    getUser,
    addUser,
    updateUser,
    fetchUsers,
    debugInfo: null,
    resetFetchState: () => setLoadError(null)
  };
};