
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Poll } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, isAfter, isBefore, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Polls = () => {
  const { polls, voteInPoll, getUser } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Sort polls by active status and then by date
  const sortedPolls = [...polls].sort((a, b) => {
    // First sort by active status
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Then sort by end date
    const aDate = new Date(a.endDate);
    const bDate = new Date(b.endDate);
    return aDate.getTime() - bDate.getTime();
  });

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

      <div className="space-y-6">
        {sortedPolls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No polls available at this time</p>
          </div>
        ) : (
          sortedPolls.map((poll) => (
            <PollCard 
              key={poll.id} 
              poll={poll} 
              currentUser={currentUser} 
              getUser={getUser}
              onVote={voteInPoll}
              toast={toast}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface PollCardProps {
  poll: Poll;
  currentUser: any;
  getUser: (userId: string) => any;
  onVote: (pollId: string, optionId: string) => Promise<void>;
  toast: any;
}

const PollCard: React.FC<PollCardProps> = ({ poll, currentUser, getUser, onVote, toast }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const creator = getUser(poll.createdBy);
  
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  const now = new Date();
  
  const isActive = poll.isActive && isAfter(endDate, now) && isBefore(now, endDate);
  const hasEnded = isAfter(now, endDate);
  
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

  return (
    <Card className={`${!isActive && "opacity-75"}`}>
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
        </div>
      </CardHeader>
      <CardContent>
        {poll.description && (
          <p className="text-sm text-gray-600 mb-4">{poll.description}</p>
        )}
        
        {hasVoted || !isActive ? (
          // Results view
          <div className="space-y-4">
            {poll.options.map((option) => {
              const voteCount = option.votes.length;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isUserVote = userVotedOption && userVotedOption.id === option.id;
              
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${isUserVote ? "text-maroon" : ""}`}>
                        {option.text} {isUserVote && "(Your vote)"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className={isUserVote ? "bg-maroon/20" : ""} />
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
      
      {isActive && !hasVoted && currentUser && (
        <CardFooter>
          <Button 
            onClick={handleVote} 
            disabled={!selectedOption || isSubmitting}
            className="bg-maroon hover:bg-maroon/90"
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default Polls;
