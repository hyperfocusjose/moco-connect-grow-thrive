
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart, Settings, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import WeeklyReport from "./Reports"; // Reuse existing Reports page/component
import { MemberForm } from "@/components/forms/MemberForm";

// Admin features configuration
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
    link: "/events?filter=pending",
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
    link: "/polls/create",
  },
  {
    title: "Settings",
    description: "Edit application or group-level settings.",
    icon: Settings,
    link: "/settings",
  },
];

const AdminPanel: React.FC = () => {
  const [overlay, setOverlay] = useState<null | "addMember" | "weeklyReport">(null);

  const handleCardClick = (feature: any) => {
    if (feature.modal) {
      setOverlay(feature.modal);
    }
  };

  // Overlay close handler
  const closeOverlay = () => {
    setOverlay(null);
  };

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
        {adminFeatures.map((feature) =>
          feature.modal ? (
            <div
              key={feature.title}
              onClick={() => handleCardClick(feature)}
              className="group cursor-pointer"
            >
              <Card className="h-full hover:shadow-lg hover:border-maroon transition">
                <CardHeader className="flex-row items-center space-y-0 gap-4">
                  <feature.icon className="text-maroon group-hover:scale-110 transition h-8 w-8 shrink-0" />
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
          )
        )}
      </div>

      {/* Add Member Modal */}
      <Dialog open={overlay === "addMember"} onOpenChange={closeOverlay}>
        <DialogContent className="sm:max-w-lg p-0" onInteractOutside={e => e.preventDefault()}>
          <MemberForm onComplete={closeOverlay} />
        </DialogContent>
      </Dialog>

      {/* Weekly Report Modal -- just reuses the same content as /reports page */}
      <Dialog open={overlay === "weeklyReport"} onOpenChange={closeOverlay}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Weekly Report</DialogTitle>
            <DialogDescription>
              {/* Could update or remove this as Reports page does. Not passing data prop */}
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
    </div>
  );
};

export default AdminPanel;
