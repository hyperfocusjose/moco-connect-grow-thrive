
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventsList from '@/components/events/EventsList';
import PendingEventsList from '@/components/events/PendingEventsList';
import { Event, User } from '@/types';
import { AlertCircle } from 'lucide-react';

interface EventTabsProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  sortedEvents: Event[];
  getUser: (id: string) => User | undefined;
  currentUser: any;
  onView: (event: Event) => void;
  onManageTuesdayMeeting: (event: Event) => void;
  onCancel: (event: Event) => void;
  onDelete: (id: string) => void;
  formatTime: (time: string) => string;
  isAdmin?: boolean;
}

const EventTabs: React.FC<EventTabsProps> = ({
  selectedTab,
  setSelectedTab,
  sortedEvents,
  getUser,
  currentUser,
  onView,
  onManageTuesdayMeeting,
  onCancel,
  onDelete,
  formatTime,
  isAdmin
}) => {
  // Create a wrapper function to adapt the onDelete function to match what EventsList expects
  const handleDelete = (event: Event) => {
    if (event.id) {
      onDelete(event.id);
    }
  };

  return (
    <Tabs defaultValue="upcoming" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
        {currentUser && <TabsTrigger value="my-events">My Events</TabsTrigger>}
        {isAdmin && <TabsTrigger value="pending">Pending Approval</TabsTrigger>}
        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <EventsList 
          events={sortedEvents} 
          getUser={getUser} 
          currentUser={currentUser} 
          onView={onView} 
          onManageTuesdayMeeting={onManageTuesdayMeeting}
          onCancel={onCancel} 
          onDelete={handleDelete} 
          formatTime={formatTime}
          isAdmin={isAdmin}
        />
      </TabsContent>
      
      <TabsContent value="past">
        <EventsList 
          events={sortedEvents} 
          getUser={getUser} 
          currentUser={currentUser} 
          onView={onView} 
          onManageTuesdayMeeting={onManageTuesdayMeeting}
          onCancel={onCancel} 
          onDelete={handleDelete} 
          formatTime={formatTime}
          isAdmin={isAdmin}
        />
      </TabsContent>
      
      <TabsContent value="my-events">
        <EventsList 
          events={sortedEvents} 
          getUser={getUser} 
          currentUser={currentUser} 
          onView={onView} 
          onManageTuesdayMeeting={onManageTuesdayMeeting}
          onCancel={onCancel} 
          onDelete={handleDelete} 
          formatTime={formatTime}
          isAdmin={isAdmin}
        />
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="pending">
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="flex items-center text-amber-800 font-medium">
              <AlertCircle className="h-5 w-5 mr-2" />
              Pending Events
            </h3>
            <p className="text-amber-700 text-sm mt-1">
              These events require your approval before they are visible to members.
            </p>
          </div>
          <PendingEventsList 
            events={sortedEvents} 
            getUser={getUser} 
            onApprove={onCancel} 
            onDisapprove={onDelete} 
            onView={onView} 
            formatTime={formatTime}
          />
        </TabsContent>
      )}
      
      <TabsContent value="cancelled">
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="flex items-center text-gray-800 font-medium">
            <AlertCircle className="h-5 w-5 mr-2" />
            Cancelled Events
          </h3>
          <p className="text-gray-700 text-sm mt-1">
            These events are cancelled and not visible to members.
          </p>
        </div>
        <EventsList 
          events={sortedEvents} 
          getUser={getUser} 
          currentUser={currentUser} 
          onView={onView} 
          onManageTuesdayMeeting={onManageTuesdayMeeting}
          onCancel={onCancel} 
          onDelete={handleDelete} 
          formatTime={formatTime}
          isAdmin={isAdmin}
          isCancelled 
        />
      </TabsContent>
    </Tabs>
  );
};

export default EventTabs;
