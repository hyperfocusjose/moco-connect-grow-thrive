import { useState, useCallback, useEffect } from 'react';
import { Poll } from '@/types';
import { demoPolls } from '@/data/demoData';
import { toast } from 'sonner';

export const usePollOperations = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  const fetchPolls = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPolls(demoPolls);
      console.log(`Successfully loaded ${demoPolls.length} demo polls`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLoadError(errorMsg);
      console.error('Error fetching polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const createPoll = async (pollData: Partial<Poll>) => {
    const newPoll: Poll = {
      id: Date.now().toString(),
      title: pollData.title || '',
      description: pollData.description || '',
      options: pollData.options || [],
      startDate: pollData.startDate || new Date(),
      endDate: pollData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: pollData.createdBy || '1',
      isActive: true,
      createdAt: new Date(),
      ...pollData,
    };
    
    setPolls(prev => [...prev, newPoll]);
    toast.success('Poll created successfully');
    return newPoll;
  };

  const updatePoll = async (id: string, pollData: Partial<Poll>) => {
    setPolls(prev => prev.map(poll => 
      poll.id === id ? { ...poll, ...pollData } : poll
    ));
    toast.success('Poll updated successfully');
    return Promise.resolve();
  };

  const deletePoll = async (id: string) => {
    setPolls(prev => prev.filter(poll => poll.id !== id));
    toast.success('Poll deleted successfully');
    return Promise.resolve();
  };

  const votePoll = async (pollId: string, optionId: string) => {
    // Update local vote tracking
    setUserVotes(prev => ({ ...prev, [pollId]: optionId }));
    
    // Update poll vote counts
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          options: poll.options.map(option => ({
            ...option,
            votes: option.id === optionId ? [...option.votes, 'current-user'] : option.votes
          }))
        };
      }
      return poll;
    }));
    
    toast.success('Vote recorded successfully');
    return Promise.resolve();
  };

  const hasVoted = (pollId: string) => {
    return pollId in userVotes;
  };

  return {
    polls,
    isLoading,
    loadError,
    createPoll,
    updatePoll,
    deletePoll,
    votePoll,
    hasVoted,
    fetchPolls
  };
};