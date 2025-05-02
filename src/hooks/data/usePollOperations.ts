
import { useState, useEffect } from 'react';
import { Poll, PollOption } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePollOperations = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch polls from Supabase
  const fetchPolls = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('Fetching polls from Supabase...');

      // Fetch polls data
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) {
        throw new Error(`Error fetching polls: ${pollsError.message}`);
      }

      // Fetch poll options data
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*');

      if (optionsError) {
        throw new Error(`Error fetching poll options: ${optionsError.message}`);
      }

      // Fetch votes data
      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select('*');

      if (votesError) {
        throw new Error(`Error fetching poll votes: ${votesError.message}`);
      }

      // Process the data to match our application's data structure
      const processedPolls = pollsData.map(poll => {
        // Find options for this poll
        const pollOptions = optionsData
          .filter(option => option.poll_id === poll.id)
          .map(option => {
            // Find votes for this option
            const optionVotes = votesData
              .filter(vote => vote.option_id === option.id)
              .map(vote => vote.user_id);

            return {
              id: option.id,
              text: option.text,
              votes: optionVotes
            } as PollOption;
          });

        return {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          options: pollOptions,
          startDate: new Date(poll.start_date),
          endDate: new Date(poll.end_date),
          createdBy: poll.created_by,
          isActive: poll.is_active,
          isArchived: poll.is_archived,
          createdAt: new Date(poll.created_at)
        } as Poll;
      });

      setPolls(processedPolls);
      console.log(`Fetched ${processedPolls.length} polls successfully`);
    } catch (error) {
      console.error('Error in fetchPolls:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error fetching polls');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new poll
  const createPoll = async (poll: Partial<Poll>): Promise<void> => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a poll",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating new poll:', poll);
      
      // Create poll record
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: poll.title,
          description: poll.description || '',
          start_date: poll.startDate?.toISOString(),
          end_date: poll.endDate?.toISOString(),
          created_by: currentUser.id,
          is_active: poll.isActive !== undefined ? poll.isActive : true,
          is_archived: poll.isArchived || false
        })
        .select('id')
        .single();

      if (pollError) {
        throw new Error(`Error creating poll: ${pollError.message}`);
      }

      const pollId = pollData.id;
      console.log('Poll created with ID:', pollId);

      // Create poll options
      if (poll.options && poll.options.length > 0) {
        const optionsToInsert = poll.options.map(option => ({
          poll_id: pollId,
          text: option.text
        }));

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionsToInsert);

        if (optionsError) {
          throw new Error(`Error creating poll options: ${optionsError.message}`);
        }
      }

      // Refresh polls after creation
      await fetchPolls();

      toast({
        title: "Success",
        description: "Poll created successfully",
      });
    } catch (error) {
      console.error('Error in createPoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create poll",
        variant: "destructive",
      });
    }
  };

  // Update an existing poll
  const updatePoll = async (id: string, pollUpdates: Partial<Poll>): Promise<void> => {
    try {
      console.log('Updating poll:', id, pollUpdates);

      // Update poll record
      const { error: pollError } = await supabase
        .from('polls')
        .update({
          title: pollUpdates.title,
          description: pollUpdates.description,
          start_date: pollUpdates.startDate?.toISOString(),
          end_date: pollUpdates.endDate?.toISOString(),
          is_active: pollUpdates.isActive,
          is_archived: pollUpdates.isArchived
        })
        .eq('id', id);

      if (pollError) {
        throw new Error(`Error updating poll: ${pollError.message}`);
      }

      // Refresh polls after update
      await fetchPolls();

      toast({
        title: "Success",
        description: "Poll updated successfully",
      });
    } catch (error) {
      console.error('Error in updatePoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update poll",
        variant: "destructive",
      });
    }
  };

  // Delete a poll
  const deletePoll = async (id: string): Promise<void> => {
    try {
      console.log('Deleting poll:', id);

      // Delete poll options first (cascade delete will remove votes)
      const { error: optionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', id);

      if (optionsError) {
        throw new Error(`Error deleting poll options: ${optionsError.message}`);
      }

      // Delete poll record
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', id);

      if (pollError) {
        throw new Error(`Error deleting poll: ${pollError.message}`);
      }

      // Refresh polls after deletion
      await fetchPolls();

      toast({
        title: "Success",
        description: "Poll deleted successfully",
      });
    } catch (error) {
      console.error('Error in deletePoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete poll",
        variant: "destructive",
      });
    }
  };

  // Vote on a poll
  const votePoll = async (pollId: string, optionId: string): Promise<void> => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Voting on poll:', pollId, 'option:', optionId);

      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', currentUser.id);

      if (checkError) {
        throw new Error(`Error checking existing vote: ${checkError.message}`);
      }

      if (existingVote && existingVote.length > 0) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from('poll_votes')
          .update({ option_id: optionId })
          .eq('poll_id', pollId)
          .eq('user_id', currentUser.id);

        if (updateError) {
          throw new Error(`Error updating vote: ${updateError.message}`);
        }
      } else {
        // Create new vote
        const { error: voteError } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            option_id: optionId,
            user_id: currentUser.id
          });

        if (voteError) {
          throw new Error(`Error creating vote: ${voteError.message}`);
        }
      }

      // Refresh polls after voting
      await fetchPolls();

      toast({
        title: "Success",
        description: "Vote recorded successfully",
      });
    } catch (error) {
      console.error('Error in votePoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  // Check if a user has voted on a poll
  const hasVoted = (pollId: string, userId: string): boolean => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return false;

    return poll.options.some(option => option.votes.includes(userId));
  };

  // Initialize polls on component mount
  useEffect(() => {
    fetchPolls();
  }, []);

  const cleanup = () => {
    // Cleanup function (if needed)
  };

  return {
    polls,
    createPoll,
    updatePoll,
    deletePoll,
    votePoll,
    hasVoted,
    isLoading,
    loadError,
    fetchPolls,
    cleanup
  };
};
