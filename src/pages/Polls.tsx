
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Poll } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isAfter, isBefore, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Archive, Trash2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Polls = () => {
  const { polls, voteInPoll, getUser, updatePoll, deleteItem } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('active');
  const [deletePollId, setDeletePollId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter polls by tab
  const filteredPolls = polls.filter(poll => {
    const now = new Date();
    const isActive = poll.isActive && isAfter(new Date(poll.endDate), now);
    
    if (selectedTab === 'active') {
      return isActive;
    } else if (selectedTab === 'archived') {
      return !isActive;
    }
    return true;
  });
  
  // Sort polls by active status and then by date
  const sortedPolls = [...filteredPolls].sort((a, b) => {
    // If on Active tab, sort by end date (soonest ending first)
    if (selectedTab === 'active') {
      const aDate = new Date(a.endDate);
      const bDate = new Date(b.endDate);
      return aDate.getTime() - bDate.getTime();
    }
    
    // If on Archived tab, sort by end date (most recently ended first)
    const aDate = new Date(a.endDate);
    const bDate = new Date(b.endDate);
    return bDate.getTime() - aDate.getTime();
  });

  // Function to handle archiving a poll
  const handleArchivePoll = async (pollId: string) => {
    try {
      await updatePoll(pollId, { isActive: false });
      toast({
        title: "Poll Archived",
        description: "The poll has been archived successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive poll",
        variant: "destructive"
      });
    }
  };

  // Function to handle deleting a poll
  const handleDeletePoll = async () => {
    if (!deletePollId) return;
    
    try {
      setIsDeleting(true);
      await deleteItem('poll', deletePollId);
      toast({
        title: "Poll Deleted",
        description: "The poll has been permanently deleted."
      });
      setDeletePollId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete poll",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Polls</h1>
          <p className="text-gray-500 mt-1">View and participate in group polls and votes</p>
        </div>
        
        {currentUser?.isAdmin && (
          <Button className="mt-4 md:mt-0 bg-maroon hover:bg-maroon/90">
            Create New Poll
          </Button>
        )}
      </div>

      <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="archived">Archived Polls</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="space-y-6">
            {sortedPolls.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No active polls available</p>
              </div>
            ) : (
              sortedPolls.map((poll) => (
                <PollCard 
                  key={poll.id} 
                  poll={poll} 
                  currentUser={currentUser} 
                  getUser={getUser}
                  onVote={voteInPoll}
                  onArchive={handleArchivePoll}
                  onDelete={(id) => setDeletePollId(id)}
                  toast={toast}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="archived">
          <div className="space-y-6">
            {sortedPolls.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No archived polls available</p>
              </div>
            ) : (
              sortedPolls.map((poll) => (
                <PollCard 
                  key={poll.id} 
                  poll={poll} 
                  currentUser={currentUser} 
                  getUser={getUser}
                  onVote={voteInPoll}
                  onArchive={handleArchivePoll}
                  onDelete={(id) => setDeletePollId(id)}
                  toast={toast}
                  isArchived
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Delete Poll Dialog */}
      <Dialog open={!!deletePollId} onOpenChange={(open) => !open && setDeletePollId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Poll Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone and all data related to this poll will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeletePollId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePoll}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Poll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PollCardProps {
  poll: Poll;
  currentUser: any;
  getUser: (userId: string) => any;
  onVote: (pollId: string, optionId: string) => Promise<void>;
  onArchive: (pollId: string) => Promise<void>;
  onDelete: (pollId: string) => void;
  toast: any;
  isArchived?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ 
  poll, 
  currentUser, 
  getUser, 
  onVote, 
  onArchive,
  onDelete,
  toast,
  isArchived = false 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showVoters, setShowVoters] = useState(false);
  const creator = getUser(poll.createdBy);
  
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  const now = new Date();
  
  const isActive = poll.isActive && isAfter(endDate, now) && isBefore(now, endDate);
  const hasEnded = isAfter(now, endDate);
  const isAdmin = currentUser?.isAdmin || false;
  
  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
  
  // Check if current user has voted
  const hasVoted = currentUser && poll.options.some(option => 
    option.votes.includes(currentUser.id)
  );
  
  // Find which option the user voted for
  const userVotedOption = currentUser && poll.options.find(option => 
    option.votes.includes(currentUser.id)
  );

  // Handle vote submission
  const handleVote = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedOption) {
      toast({
        title: "Selection Required",
        description: "Please select an option to vote.",
        variant: "destructive"
      });
      return;
    }
    
    if (hasVoted) {
      toast({
        title: "Already Voted",
        description: "You have already voted in this poll.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onVote(poll.id, selectedOption);
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle archiving a poll
  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      await onArchive(poll.id);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive poll",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Card className={`${!isActive && !isArchived && "opacity-75"}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{poll.title}</CardTitle>
            <CardDescription className="mt-1">
              Created by {creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown'} • 
              {hasEnded 
                ? ` Ended ${formatDistanceToNow(endDate, { addSuffix: true })}` 
                : ` Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`
              }
            </CardDescription>
          </div>
          <div className="flex space-x-2 items-center">
            {isActive && (
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Active
              </div>
            )}
            {hasEnded && (
              <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Closed
              </div>
            )}
            {isArchived && (
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                Archived
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {poll.description && (
          <p className="text-sm text-gray-600 mb-4">{poll.description}</p>
        )}
        
        {hasVoted || !isActive || isArchived ? (
          // Results view
          <div className="space-y-4">
            {isAdmin && (
              <div className="flex justify-end mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowVoters(!showVoters)}
                >
                  {showVoters ? "Hide Voters" : "Show Voters"}
                </Button>
              </div>
            )}
            
            {poll.options.map((option) => {
              const voteCount = option.votes.length;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isUserVote = userVotedOption && userVotedOption.id === option.id;
              
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${isUserVote ? "text-maroon" : ""}`}>
                        {option.text} 
                        {isUserVote && currentUser && (
                          <span className="inline-flex items-center ml-2 text-xs text-maroon">
                            <Check className="w-3 h-3 mr-1" /> Your vote
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className={isUserVote ? "bg-maroon/20" : ""} />
                  
                  {/* Show voters if admin and showVoters is true */}
                  {isAdmin && showVoters && voteCount > 0 && (
                    <div className="mt-1 pl-2 border-l-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Voters:</p>
                      <div className="space-y-1">
                        {option.votes.map((voterId) => {
                          const voter = getUser(voterId);
                          return voter ? (
                            <div key={voterId} className="text-xs text-gray-600">
                              {voter.firstName} {voter.lastName}
                            </div>
                          ) : (
                            <div key={voterId} className="text-xs text-gray-600">
                              Unknown User
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <p className="text-sm text-gray-500 mt-2">
              Total votes: {totalVotes}
            </p>
          </div>
        ) : (
          // Vote view
          <RadioGroup value={selectedOption || ''} onValueChange={setSelectedOption}>
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                  <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          {isActive && !hasVoted && currentUser && (
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption || isSubmitting}
              className="bg-maroon hover:bg-maroon/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Vote"}
            </Button>
          )}
          
          {hasVoted && currentUser && isActive && (
            <Button 
              variant="outline" 
              disabled
              className="flex items-center"
            >
              <Check className="w-4 h-4 mr-2" /> VOTED!
            </Button>
          )}
        </div>
        
        {isAdmin && !isArchived && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleArchive}
              disabled={isArchiving}
              className="flex items-center"
            >
              <Archive className="w-4 h-4 mr-2" />
              {isArchiving ? "Archiving..." : "Archive Poll"}
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(poll.id)}
              className="flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Poll
            </Button>
          </div>
        )}
        
        {isAdmin && isArchived && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(poll.id)}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Poll
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Polls;
