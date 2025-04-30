
import React from 'react';
import { Button } from '@/components/ui/button';

interface EventViewToggleProps {
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
}

const EventViewToggle: React.FC<EventViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="border rounded-md p-1">
      <Button 
        variant={viewMode === 'list' ? 'default' : 'ghost'} 
        size="sm" 
        onClick={() => setViewMode('list')}
        className={viewMode === 'list' ? 'bg-maroon hover:bg-maroon/90' : ''}
      >
        List
      </Button>
      <Button 
        variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
        size="sm" 
        onClick={() => setViewMode('calendar')}
        className={viewMode === 'calendar' ? 'bg-maroon hover:bg-maroon/90' : ''}
      >
        Calendar
      </Button>
    </div>
  );
};

export default EventViewToggle;
