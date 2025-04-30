
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, History } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import CreateEventDialog from './dialogs/CreateEventDialog';

interface EventsHeaderProps {
  isAdmin: boolean;
  onOpenPresenterHistory: () => void;
}

const EventsHeader: React.FC<EventsHeaderProps> = ({ 
  isAdmin,
  onOpenPresenterHistory,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 mt-1">Browse and manage events for MocoPNG</p>
      </div>
      
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        {isAdmin && (
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={onOpenPresenterHistory}
          >
            <History className="mr-1 h-4 w-4" /> Presenter History
          </Button>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-maroon hover:bg-maroon/90">
              <Plus className="mr-1 h-4 w-4" /> Create New Event
            </Button>
          </DialogTrigger>
          <CreateEventDialog />
        </Dialog>
      </div>
    </div>
  );
};

export default EventsHeader;
