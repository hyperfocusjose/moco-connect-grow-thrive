import { useState, useEffect } from 'react';
import { Poll, PollOption } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePollOperations = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [userMap, setUserMap] = useState<Record<string, { firstName: string, lastName: string, email: string }>>({});

  const fetchPolls = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw new Error(pollsError.message);

      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*');
      if (optionsError) throw new Error(optionsError.message);

      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select('*');
      if (votesError) throw new Error(votesError.message);

      const voterIds = new Set<string>();
      votesData.forEach(vote => {
        if (vote.user_id) voterIds.add(vote.user_id);
      });

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', Array.from(voterIds));

      if (profilesError) throw new Error(profilesError.message);

      const userProfiles: Record<string, { firstName: string, lastName: string, email: string }> = {};
      profilesData?.forEach(profile => {
        userProfiles[profile.id] = {
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || ''
        };
      });

      setUserMap(userProfiles);

      const processedPolls: Poll[] = pollsData.map(poll => {
        const pollOptions = optionsData
          .filter(opt => opt.poll_id === poll.id)
          .map(option => {
            const relatedVotes = votesData.filter(v => v.option_id === option.id);
            const basicVotes = relatedVotes.map(v => v.user_id || '');

            const voteDetails = currentUser?.isAdmin
              ? relatedVotes.map(v => {
                  const user = userProfiles[v.user_id || ''];
                  return {
                    userId: v.user_id || '',
                    name: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown',
                    email: user?.email || 'Unknown'
                  };
                })
              : undefined;

            return {
              id: option.id,
              text: option.text,
              votes: basicVotes,
              ...(voteDetails ? { voteDetails } : {})
            };
          });

        return {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          startDate: new Date(poll.start_date),
          endDate: new Date(poll.end_date),
          createdBy: poll.created_by,
          isActive: poll.is_active,
          isArchived: poll.is_archived,
          createdAt: new Date(poll.created_at),
          options: pollOptions,
        };
      });

      setPolls(processedPolls);
    } catch (error) {
      console.error('Error in fetchPolls:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load polls');
    } finally {
      setIsLoading(false);
    }
  };

  const createPoll = async (poll: Partial<Poll>): Promise<void> => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to create a poll", variant: "destructive" });
      return;
    }

    const ADMIN_ID = '31727ff4-213c-492a-bbc6-ce91c8bab2d2';
    if (currentUser.id !== ADMIN_ID) {
      toast({ title: "Access Denied", description: "Only the admin can create polls", variant: "destructive" });
      return;
    }

    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: poll.title,
          description: poll.description || '',
          start_date: poll.startDate?.toISOString(),
          end_date: poll.endDate?.toISOString(),
          created_by: currentUser.id,
          is_active: poll.isActive ?? true,
          is_archived: poll.isArchived ?? false,
        })
        .select('id')
        .single();

      if (pollError) throw new Error(pollError.message);
      const pollId = pollData.id;

      if (poll.options && poll.options.length > 0) {
        const optionsToInsert = poll.options.map(opt => ({
          poll_id: pollId,
          text: opt.text,
        }));

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionsToInsert);
        if (optionsError) throw new Error(optionsError.message);
      }

      await fetchPolls();
      toast({ title: "Success", description: "Poll created successfully" });
    } catch (error) {
      console.error('Error in createPoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create poll",
        variant: "destructive",
      });
    }
  };

  const updatePoll = async (id: string, updates: Partial<Poll>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({
          title: updates.title,
          description: updates.description,
          start_date: updates.startDate?.toISOString(),
          end_date: updates.endDate?.toISOString(),
          is_active: updates.isActive,
          is_archived: updates.isArchived,
        })
        .eq('id', id);

      if (error) throw new Error(error.message);

      await fetchPolls();
      toast({ title: "Success", description: "Poll updated successfully" });
    } catch (error) {
      console.error('Error in updatePoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update poll",
        variant: "destructive",
      });
    }
  };

  const deletePoll = async (id: string): Promise<void> => {
    try {
      const { error: optionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', id);
      if (optionsError) throw new Error(optionsError.message);

      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', id);
      if (pollError) throw new Error(pollError.message);

      await fetchPolls();
      toast({ title: "Success", description: "Poll deleted successfully" });
    } catch (error) {
      console.error('Error in deletePoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete poll",
        variant: "destructive",
      });
    }
  };

  const votePoll = async (pollId: string, optionId: string): Promise<void> => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to vote", variant: "destructive" });
      return;
    }

    try {
      const { data: existingVote, error: checkError } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', currentUser.id);

      if (checkError) throw new Error(checkError.message);

      if (existingVote && existingVote.length > 0) {
        const { error: updateError } = await supabase
          .from('poll_votes')
          .update({ option_id: optionId })
          .eq('poll_id', pollId)
          .eq('user_id', currentUser.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            option_id: optionId,
            user_id: currentUser.id,
          });

        if (insertError) throw new Error(insertError.message);
      }

      await fetchPolls();
      toast({ title: "Success", description: "Vote recorded successfully" });
    } catch (error) {
      console.error('Error in votePoll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  const hasVoted = (pollId: string, userId: string): boolean => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return false;
    return poll.options.some(opt => opt.votes.includes(userId));
  };

  const getUser = (userId: string) => {
    if (userMap[userId]) {
      const user = userMap[userId];
      if (user.firstName || user.lastName) {
        return {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email
        };
      }
      return {
        firstName: user.email.split('@')[0] || '',
        lastName: '',
        email: user.email
      };
    }
    return null;
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const cleanup = () => {};

  return {
    polls,
    isLoading,
    loadError,
    fetchPolls,
    createPoll,
    updatePoll,
    deletePoll,
    votePoll,
    hasVoted,
    getUser,
    cleanup,
  };
};