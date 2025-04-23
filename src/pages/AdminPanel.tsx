
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart, Settings, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import WeeklyReport from "./Reports";
import { MemberForm } from "@/components/forms/MemberForm";
import { Badge } from "@/components/ui/badge";

// --- Simple placeholder: create poll form ---
const PollForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
  <div className="p-6">
    <h2 className="text-lg font-semibold mb-2">Create a New Poll</h2>
    <form
      className="space-y-3"
      onSubmit={e => {
        e.preventDefault();
        // Here, you could integrate with actual poll creation.
        onComplete();
      }}
    >
      <input className="w-full border rounded px-2 py-1" placeholder="Poll question" required />
      <input className="w-full border rounded px-2 py-1" placeholder="Option 1" required />
      <input className="w-full border rounded px-2 py-1" placeholder="Option 2" required />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onComplete}>Cancel</Button>
        <Button type="submit" className="bg-maroon hover:bg-maroon/90">Create Poll</Button>
      </div>
    </form>
  </div>
);

// --- Simple placeholder: pending events overlay ---
const PendingEventsList: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // This would actually fetch real data using react-query or context
  // For demo purposes, we'll just mock a list and action
  const [pendingEvents, setPendingEvents] = useState([
    { id: 1, name: "Spring Social", date: "2025-05-02", requestedBy: "Alex" },
    { id: 2, name: "Fundraiser", date: "2025-05-10", requestedBy: "Sam" },
  ]);

  const approveEvent = (id: number) => {
    setPendingEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Pending Event Approvals</DialogTitle>
        <DialogDescription>Approve or reject pending group event submissions.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[48vh] pr-2 mb-4">
        {pendingEvents.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No pending events.</div>
        ) : (
          <ul className="space-y-4">
            {pendingEvents.map((event) => (
              <li key={event.id} className="p-4 rounded border flex flex-col md:flex-row gap-2 justify-between items-center bg-muted">
                <div>
                  <div className="font-medium">{event.name}</div>
                  <div className="text-xs text-gray-500">Requested by {event.requestedBy} &middot; {event.date}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-maroon hover:bg-maroon/90" onClick={() => approveEvent(event.id)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => approveEvent(event.id)}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <div className="flex justify-end mt-2">
        <DialogClose asChild>
          <Button className="bg-maroon hover:bg-maroon/90" onClick={onClose}>Close</Button>
        </DialogClose>
      </div>
    </div>
  );
};

// -- Mock pending events count for badge (would be fetched real-time in a full app)
const usePendingEventsCount = () => {
  // this can be replaced with real query/hook logic
  const [count, setCount] = useState(2);
  // Optionally fetch and update
  return count;
};

// Admin features configuration (updated to modal triggers only where required)
const adminFeatures = [
  {
    title: "Add New Member",
    description: "Add a new member to the group.",
    icon: Users,
    modal: "addMember",
  },
  {
    title: "Approve Events",
    description: "Review and approve pending event submissions.",
    icon: Calendar,
    modal: "approveEvents",
  },
  {
    title: "Weekly Reports",
    description: "View the latest weekly group performance report.",
    icon: BarChart,
    modal: "weeklyReport",
  },
  {
    title: "Create Poll",
    description: "Create a new poll or survey for members.",
    icon: ClipboardList,
    modal: "createPoll",
  },
  {
    title: "Settings",
    description: "Edit application or group-level settings.",
    icon: Settings,
    link: "/settings",
  },
];

const AdminPanel: React.FC = () => {
  const [overlay, setOverlay] = useState<null | "addMember" | "weeklyReport" | "createPoll" | "approveEvents">(null);
  const pendingEventsCount = usePendingEventsCount();

  const handleCardClick = (feature: any) => {
    if (feature.modal) {
      setOverlay(feature.modal);
    }
  };

  const closeOverlay = () => setOverlay(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>👑 Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Welcome! Here you can access quick admin functions for your group.
          </p>
          <p className="text-sm text-gray-500">
            Click a tile below to perform common administrative tasks.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {adminFeatures.map((feature) => {
          // Badge logic for Approve Events
          const showBadge = feature.modal === "approveEvents" && pendingEventsCount > 0;
          return feature.modal ? (
            <div
              key={feature.title}
              onClick={() => handleCardClick(feature)}
              className="group cursor-pointer relative"
            >
              <Card className="h-full hover:shadow-lg hover:border-maroon transition">
                <CardHeader className="flex-row items-center space-y-0 gap-4">
                  <span className="relative">
                    <feature.icon className="text-maroon group-hover:scale-110 transition h-8 w-8 shrink-0" />
                    {showBadge && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1.5 -right-1.5 text-xs px-1.5 py-0.5"
                      >
                        {pendingEventsCount}
                      </Badge>
                    )}
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Link to={feature.link} key={feature.title} className="group">
              <Card className="h-full hover:shadow-lg hover:border-maroon transition">
                <CardHeader className="flex-row items-center space-y-0 gap-4">
                  <feature.icon className="text-maroon group-hover:scale-110 transition h-8 w-8 shrink-0" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Add Member Modal */}
      <Dialog open={overlay === "addMember"} onOpenChange={closeOverlay}>
        <DialogContent className="sm:max-w-lg p-0" onInteractOutside={e => e.preventDefault()}>
          <MemberForm onComplete={closeOverlay} />
        </DialogContent>
      </Dialog>

      {/* Weekly Report Modal */}
      <Dialog open={overlay === "weeklyReport"} onOpenChange={closeOverlay}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Weekly Report</DialogTitle>
            <DialogDescription>
              Most recent weekly report below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <WeeklyReport />
          </ScrollArea>
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button className="bg-maroon hover:bg-maroon/90">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Poll Modal */}
      <Dialog open={overlay === "createPoll"} onOpenChange={closeOverlay}>
        <DialogContent className="sm:max-w-lg p-0" onInteractOutside={e => e.preventDefault()}>
          <PollForm onComplete={closeOverlay} />
        </DialogContent>
      </Dialog>

      {/* Approve Events Modal */}
      <Dialog open={overlay === "approveEvents"} onOpenChange={closeOverlay}>
        <DialogContent className="sm:max-w-xl">
          <PendingEventsList onClose={closeOverlay} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
