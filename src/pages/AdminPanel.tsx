
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart, Settings, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

const adminFeatures = [
  {
    title: "Manage Users",
    description: "View, edit, or remove group members.",
    icon: Users,
    link: "#", // Replace with your user management route
  },
  {
    title: "Review Events",
    description: "Approve, edit, or remove event submissions.",
    icon: Calendar,
    link: "#", // Replace with your events admin route
  },
  {
    title: "Advanced Reports",
    description: "Get insights and detailed group statistics.",
    icon: BarChart,
    link: "#", // Replace with your reports admin route
  },
  {
    title: "Polls & Surveys",
    description: "Manage or create community polls.",
    icon: ClipboardList,
    link: "#", // Replace with your polls admin route
  },
  {
    title: "Settings",
    description: "Edit application or group-level settings.",
    icon: Settings,
    link: "#", // Replace with your settings admin route
  },
];

const AdminPanel: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>👑 Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Welcome! Here you can manage critical aspects of your group.
          </p>
          <p className="text-sm text-gray-500">
            Click a tile below to access admin functions.
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
