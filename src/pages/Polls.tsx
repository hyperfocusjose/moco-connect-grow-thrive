import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Poll as PollType, PollOption as PollOptionType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { isAfter, isBefore } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, FilePlus, Archive, Trash2, FileText } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Polls = () => {
  const { currentUser } = useAuth();
  const { polls, createPoll, updatePoll, deletePoll, votePoll, hasVoted } = useData();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('active');
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 1 week duration
  });
  const [selectedPoll, setSelectedPoll] = useState<PollType | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  
  const isAdmin = currentUser?.isAdmin;

  // Filter polls based on the selected tab
  const filteredPolls = polls.filter(poll => {
    const now = new Date();
    
    if (selectedTab === 'active') {
      return poll.isActive && !poll.isArchived;
    } else if (selectedTab === 'closed') {
      return !poll.isActive && !poll.isArchived;
    } else if (selectedTab === 'archived') {
      return poll.isArchived === true;
    }
    return false;
  });

  // Sort polls by creation date (newest first)
  const sortedPolls = [...filteredPolls].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleAddOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, '']
    });
  };

  const handleChangeOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({
      ...newPoll,
      options: updatedOptions
    });
  };

  const handleRemoveOption = (index: number) => {
    if (newPoll.options.length <= 2) {
      toast({
        title: "Error",
        description: "A poll must have at least 2 options",
        variant: "destructive",
      });
      return;
    }
    
    const updatedOptions = newPoll.options.filter((_, i) => i !== index);
    setNewPoll({
      ...newPoll,
      options: updatedOptions
    });
  };

  const handleCreatePoll = () => {
    // Validate poll data
    if (!newPoll.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a poll title",
        variant: "destructive",
      });
      return;
    }
    
    if (newPoll.options.some(option => !option.trim())) {
      toast({
        title: "Error",
        description: "All poll options must have text",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPoll.startDate || !newPoll.endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }
    
    if (newPoll.endDate < newPoll.startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    // Create poll options
    const pollOptions: PollOptionType[] = newPoll.options.map((option, index) => ({
      id: `option-${Date.now()}-${index}`,
      text: option,
      votes: []
    }));

    // Create the poll
    const pollData: Partial<PollType> = {
      title: newPoll.title,
      description: newPoll.description,
      options: pollOptions,
      startDate: newPoll.startDate,
      endDate: newPoll.endDate,
      createdBy: currentUser?.id || '',
      isActive: true,
      isArchived: false,
      createdAt: new Date()
    };

    createPoll(pollData);
    
    // Reset the form
    setNewPoll({
      title: '',
      description: '',
      options: ['', ''],
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    });

    toast({
      title: "Poll created",
      description: "Your poll has been created successfully",
    });
  };

  const handleVote = (pollId: string) => {
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Please select an option to vote",
        variant: "destructive",
      });
      return;
    }

    votePoll(pollId, selectedOption, currentUser?.id || '');
    setSelectedOption('');
    
    toast({
      title: "Vote recorded",
      description: "Your vote has been recorded successfully",
    });
  };

  const handleArchivePoll = (poll: PollType) => {
    const updatedPoll = { ...poll, isArchived: true };
    updatePoll(poll.id, updatedPoll);
    
    toast({
      title: "Poll archived",
      description: "The poll has been moved to the archives",
    });
  };

  const handleActivatePoll = (poll: PollType) => {
    const updatedPoll = { ...poll, isArchived: false, isActive: true };
    updatePoll(poll.id, updatedPoll);
    
    toast({
      title: "Poll activated",
      description: "The poll has been moved to active polls",
    });
  };

  const handleClosePoll = (poll: PollType) => {
    const updatedPoll = { ...poll, isActive: false };
    updatePoll(poll.id, updatedPoll);
    
    toast({
      title: "Poll closed",
      description: "The poll is now closed for voting",
    });
  };

  const handleDeletePoll = (pollId: string) => {
    deletePoll(pollId);
    
    toast({
      title: "Poll deleted",
      description: "The poll has been permanently deleted",
    });
  };

  const calculateResults = (poll: PollType) => {
    const totalVotes = poll.options.reduce((total, option) => total + option.votes.length, 0);
    
    return poll.options.map(option => ({
      option,
      percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Polls</h1>
          <p className="text-gray-500 mt-1">Vote and view group polls</p>
        </div>
        
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-maroon hover:bg-maroon/90 mt-4 md:mt-0">
                <FilePlus className="mr-2 h-4 w-4" />
                Create New Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
                <DialogDescription>
                  Create a new poll for members to vote on.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title*
                  </Label>
                  <Input
                    id="title"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter poll title"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newPoll.description}
                    onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter poll description (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">
                    Options*
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleChangeOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          disabled={newPoll.options.length <= 2}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="mt-2"
                    >
                      Add Option
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date*
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPoll.startDate ? format(newPoll.startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPoll.startDate}
                          onSelect={(date) => date && setNewPoll({ ...newPoll, startDate: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date*
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPoll.endDate ? format(newPoll.endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPoll.endDate}
                          onSelect={(date) => date && setNewPoll({ ...newPoll, endDate: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreatePoll} className="bg-maroon hover:bg-maroon/90">
                  Create Poll
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="closed">Closed Polls</TabsTrigger>
          <TabsTrigger value="archived">Archived Polls</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {sortedPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPolls.map((poll) => (
                <PollCard 
                  key={poll.id} 
                  poll={poll}
                  currentUser={currentUser}
                  onVote={(pollId) => handleVote(pollId)}
                  onArchive={(poll) => handleArchivePoll(poll)}
                  onDelete={(pollId) => handleDeletePoll(pollId)}
                  onClose={(poll) => handleClosePoll(poll)}
                  setSelectedPoll={setSelectedPoll}
                  setSelectedOption={setSelectedOption}
                  selectedOption={selectedOption}
                  hasUserVoted={hasVoted(poll.id, currentUser?.id || '')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No active polls found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="closed">
          {sortedPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPolls.map((poll) => (
                <PollResultCard 
                  key={poll.id} 
                  poll={poll}
                  currentUser={currentUser}
                  onArchive={(poll) => handleArchivePoll(poll)}
                  onDelete={(pollId) => handleDeletePoll(pollId)}
                  onActivate={(poll) => handleActivatePoll(poll)}
                  calculateResults={calculateResults}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No closed polls found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived">
          {sortedPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPolls.map((poll) => (
                <PollResultCard 
                  key={poll.id} 
                  poll={poll}
                  currentUser={currentUser}
                  onArchive={(poll) => {}} // Already archived
                  onDelete={(pollId) => handleDeletePoll(pollId)}
                  onActivate={(poll) => handleActivatePoll(poll)}
                  calculateResults={calculateResults}
                  isArchived
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No archived polls found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedPoll && (
        <Dialog open={!!selectedPoll} onOpenChange={(open) => !open && setSelectedPoll(null)}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{selectedPoll.title}</DialogTitle>
              <DialogDescription>
                {selectedPoll.description}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Poll runs from {format(new Date(selectedPoll.startDate), "MMMM d, yyyy")} to {format(new Date(selectedPoll.endDate), "MMMM d, yyyy")}
                </p>
              </div>
              
              {hasVoted(selectedPoll.id, currentUser?.id || '') ? (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700 font-medium">You've already voted in this poll</p>
                  </div>
                </div>
              ) : (
                <RadioGroup 
                  value={selectedOption} 
                  onValueChange={setSelectedOption}
                  className="space-y-4"
                >
                  {selectedPoll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id}>{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {isAdmin && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-medium mb-2">Poll Results</h4>
                  <div className="space-y-4">
                    {calculateResults(selectedPoll).map(({ option, percentage }) => (
                      <div key={option.id} className="space-y-1">
                        <div className="flex justify-between">
                          <span>{option.text}</span>
                          <span className="font-medium">{percentage}% ({option.votes.length} votes)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-maroon h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        {isAdmin && (
                          <div className="text-xs text-gray-500 mt-1">
                            {option.votes.length > 0 ? (
                              <span>Voters: {option.votes.map(userId => {
                                const user = useData().getUser(userId);
                                return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
                              }).join(', ')}</span>
                            ) : (
                              <span>No votes yet</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete Poll
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the poll and all its votes. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            handleDeletePoll(selectedPoll.id);
                            setSelectedPoll(null);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Poll
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                {!hasVoted(selectedPoll.id, currentUser?.id || '') && selectedPoll.isActive && (
                  <Button
                    onClick={() => handleVote(selectedPoll.id)}
                    disabled={!selectedOption}
                    className="bg-maroon hover:bg-maroon/90"
                  >
                    Submit Vote
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface PollCardProps {
  poll: PollType;
  currentUser: any;
  onVote: (pollId: string) => void;
  onArchive: (poll: PollType) => void;
  onDelete: (pollId: string) => void;
  onClose: (poll: PollType) => void;
  setSelectedPoll: (poll: PollType) => void;
  setSelectedOption: (optionId: string) => void;
  selectedOption: string;
  hasUserVoted: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ 
  poll, 
  currentUser, 
  onVote, 
  onArchive, 
  onDelete, 
  onClose,
  setSelectedPoll,
  setSelectedOption,
  selectedOption,
  hasUserVoted
}) => {
  const isAdmin = currentUser?.isAdmin;
  const [voteView, setVoteView] = useState(false);
  
  // Get the total number of votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
  
  const handleViewPoll = () => {
    setSelectedPoll(poll);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{poll.title}</CardTitle>
          <Badge variant={poll.isActive ? "default" : "secondary"} className={poll.isActive ? "bg-green-600" : ""}>
            {poll.isActive ? "Active" : "Closed"}
          </Badge>
        </div>
        <CardDescription>
          {poll.description}
        </CardDescription>
        <CardDescription className="text-xs mt-1">
          {format(new Date(poll.startDate), "MMM d")} - {format(new Date(poll.endDate), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        {voteView ? (
          <div className="space-y-4">
            <RadioGroup 
              value={selectedOption} 
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`card-${option.id}`} />
                  <Label htmlFor={`card-${option.id}`}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setVoteView(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  onVote(poll.id);
                  setVoteView(false);
                }} 
                disabled={!selectedOption}
                className="bg-maroon hover:bg-maroon/90"
                size="sm"
              >
                Submit Vote
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm">Total votes: {totalVotes}</p>
            
            {hasUserVoted && (
              <div className="bg-green-50 p-2 rounded-md mt-3 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <p className="text-green-700 text-sm">You've voted</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        {!voteView && !hasUserVoted && poll.isActive ? (
          <Button 
            variant="default" 
            className="bg-maroon hover:bg-maroon/90" 
            size="sm"
            onClick={() => setVoteView(true)}
          >
            Vote
          </Button>
        ) : !voteView ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewPoll}
          >
            <FileText className="h-4 w-4 mr-1" />
            View Details
          </Button>
        ) : null}
        
        {isAdmin && !voteView && (
          <div className="flex space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive this poll?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will move the poll to the archives. It will still be visible but marked as archived.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onArchive(poll)}>
                    Archive Poll
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {poll.isActive && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => onClose(poll)}
              >
                Close Poll
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this poll?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the poll and all its data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(poll.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Poll
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

interface PollResultCardProps {
  poll: PollType;
  currentUser: any;
  onArchive: (poll: PollType) => void;
  onDelete: (pollId: string) => void;
  onActivate: (poll: PollType) => void;
  calculateResults: (poll: PollType) => Array<{
    option: PollOptionType;
    percentage: number;
  }>;
  isArchived?: boolean;
}

const PollResultCard: React.FC<PollResultCardProps> = ({ 
  poll, 
  currentUser, 
  onArchive, 
  onDelete, 
  onActivate,
  calculateResults,
  isArchived = false
}) => {
  const isAdmin = currentUser?.isAdmin;
  const [showDetails, setShowDetails] = useState(false);
  
  const results = calculateResults(poll);
  
  // Get the total number of votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
  
  // Find the winning option(s)
  const maxVotes = Math.max(...poll.options.map(option => option.votes.length));
  const winningOptions = poll.options.filter(option => option.votes.length === maxVotes);
  
  return (
    <Card className={`overflow-hidden ${isArchived ? 'bg-gray-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{poll.title}</CardTitle>
          <Badge variant={isArchived ? "outline" : "secondary"} className={isArchived ? "border-gray-400 text-gray-600" : ""}>
            {isArchived ? "Archived" : "Closed"}
          </Badge>
        </div>
        <CardDescription>
          {poll.description}
        </CardDescription>
        <CardDescription className="text-xs mt-1">
          {format(new Date(poll.startDate), "MMM d")} - {format(new Date(poll.endDate), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div>
          <p className="text-sm mb-3">Total votes: {totalVotes}</p>
          
          {showDetails ? (
            <div className="space-y-3">
              {results.map(({ option, percentage }) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span className="font-medium">{percentage}% ({option.votes.length})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${
                        option.votes.length === maxVotes && maxVotes > 0 
                          ? 'bg-green-500' 
                          : 'bg-gray-500'
                      } h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {isAdmin && (
                    <div className="text-xs text-gray-500 mt-1">
                      {option.votes.length > 0 ? (
                        <span>Voters: {option.votes.map(userId => {
                          const user = useData().getUser(userId);
                          return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
                        }).join(', ')}</span>
                      ) : (
                        <span>No votes</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              <Button variant="outline" size="sm" onClick={() => setShowDetails(false)} className="mt-2">
                Hide Details
              </Button>
            </div>
          ) : (
            <>
              {totalVotes > 0 ? (
                <div>
                  <div className="mb-3">
                    <p className="font-medium">
                      {winningOptions.length === 1 ? 'Winning option:' : 'Tied options:'}
                    </p>
                    <ul className="list-disc pl-5 mt-1">
                      {winningOptions.map(option => (
                        <li key={option.id} className="text-sm">
                          {option.text} ({option.votes.length} votes)
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                    View All Results
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No votes were cast in this poll.</p>
              )}
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        {isAdmin && (
          <div className="flex space-x-2">
            {!isArchived && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive this poll?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will move the poll to the archives. It will still be visible but marked as archived.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onArchive(poll)}>
                      Archive Poll
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {isArchived && (
              <Button 
                variant="default" 
                size="sm"
                className="bg-maroon hover:bg-maroon/90"
                onClick={() => onActivate(poll)}
              >
                Activate
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this poll?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the poll and all its data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(poll.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Poll
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        
        {!isAdmin && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Results" : "View Results"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Polls;
