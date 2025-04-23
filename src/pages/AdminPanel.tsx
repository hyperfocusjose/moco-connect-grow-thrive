
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart, Settings, ClipboardList } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const adminFeatures = [
  {
    title: "Add New User",
    description: "Create a new account for a group member.",
    icon: Users,
    link: "/signup", // Link to signup page for new user creation
  },
  {
    title: "Approve Events",
    description: "Review and approve pending event submissions.",
    icon: Calendar,
    link: "/events?filter=pending", // Link to events page with pending filter
  },
  {
    title: "Weekly Reports",
    description: "View and generate standard group reports.",
    icon: BarChart,
    link: "/reports", // Link to reports page
  },
  {
    title: "Create Poll",
    description: "Create a new poll or survey for members.",
    icon: ClipboardList,
    link: "/polls/create", // Link to poll creation
  },
  {
    title: "Settings",
    description: "Edit application or group-level settings.",
    icon: Settings,
    link: "/settings", // Link to settings page
  },
];

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  
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
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
