
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { PollOption } from "@/types";

interface CreatePollOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePollOverlay: React.FC<CreatePollOverlayProps> = ({
  open, onClose
}) => {
  const { createPoll } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 1 week duration
  });

  if (!open) return null;
  
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

  const handleCreatePoll = async () => {
    try {
      setIsSubmitting(true);
      
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
      const pollOptions: PollOption[] = newPoll.options.map((option) => ({
        id: `temp-${Date.now()}-${Math.random()}`, // This will be replaced by Supabase
        text: option,
        votes: []
      }));

      // Create the poll
      const pollData: any = {
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

      console.log('Creating poll with data:', pollData);
      await createPoll(pollData);
      
      // Reset the form
      setNewPoll({
        title: '',
        description: '',
        options: ['', ''],
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      });
      
      // Close the overlay
      onClose();
      
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg w-[90%] max-w-[550px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Poll</h2>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

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
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePoll} 
            className="bg-maroon hover:bg-maroon/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Poll"}
          </Button>
        </div>
      </div>
    </div>
  );
};
