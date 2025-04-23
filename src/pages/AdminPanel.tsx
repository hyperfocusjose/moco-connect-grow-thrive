import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart, Settings, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { AdminFeatureCard } from "@/components/admin/AdminFeatureCard";
import { AddMemberOverlay } from "@/components/admin/AddMemberOverlay";
import { WeeklyReportOverlay } from "@/components/admin/WeeklyReportOverlay";
import { CreatePollOverlay } from "@/components/admin/CreatePollOverlay";
import { ApproveEventsOverlay } from "@/components/admin/ApproveEventsOverlay";
import PresenterHistoryDialog from "@/components/events/PresenterHistoryDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import WeeklyReport from "./Reports";
import { MemberForm } from "@/components/forms/MemberForm";
import { Badge } from "@/components/ui/badge";

// Define the overlay type
type OverlayType = "addMember" | "weeklyReport" | "createPoll" | "approveEvents" | "presenterHistory" | null;

const PendingEventsList: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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

const usePendingEventsCount = () => {
  const [count] = React.useState(2);
  return count;
};

const adminFeatures = [
  {
    title: "Add New Member",
    description: "Add a new member to the group.",
    icon: Users,
    modal: "addMember" as OverlayType,
  },
  {
    title: "Approve Events",
    description: "Review and approve pending event submissions.",
    icon: Calendar,
    modal: "approveEvents" as OverlayType,
  },
  {
    title: "Weekly Reports",
    description: "View the latest weekly group performance report.",
    icon: BarChart,
    modal: "weeklyReport" as OverlayType,
  },
  {
    title: "Create Poll",
    description: "Create a new poll or survey for members.",
    icon: ClipboardList,
    modal: "createPoll" as OverlayType,
  },
  {
    title: "Settings",
    description: "Edit application or group-level settings.",
    icon: Settings,
    link: "/settings",
  },
  {
    title: "Presenter History",
    description: "View the presenters at past Tuesday meetings.",
    icon: BarChart,
    modal: "presenterHistory" as OverlayType,
  },
];

const AdminPanel: React.FC = () => {
  const [overlay, setOverlay] = React.useState<OverlayType>(null);
  const pendingEventsCount = usePendingEventsCount();
  const { events, getUser } = useData();

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
        {adminFeatures.map((feature) => (
          <AdminFeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            showBadge={feature.modal === "approveEvents"}
            badgeCount={feature.modal === "approveEvents" ? pendingEventsCount : undefined}
            onClick={
              feature.modal
                ? () => setOverlay(feature.modal)
                : undefined
            }
            link={feature.link}
          />
        ))}
      </div>

      {/* Admin overlays */}
      <AddMemberOverlay open={overlay === "addMember"} onClose={() => setOverlay(null)} />
      <WeeklyReportOverlay open={overlay === "weeklyReport"} onClose={() => setOverlay(null)} />
      <CreatePollOverlay open={overlay === "createPoll"} onClose={() => setOverlay(null)} />
      <ApproveEventsOverlay open={overlay === "approveEvents"} onClose={() => setOverlay(null)} />
      <PresenterHistoryDialog
        open={overlay === "presenterHistory"}
        onOpenChange={() => setOverlay(null)}
        events={events}
        getUser={getUser}
      />
    </div>
  );
};

export default AdminPanel;
