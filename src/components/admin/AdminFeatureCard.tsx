
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminFeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
  link?: string;
  showBadge?: boolean;
  badgeCount?: number;
}

export const AdminFeatureCard: React.FC<AdminFeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  link,
  showBadge,
  badgeCount,
}) => {
  const content = (
    <Card className="h-full hover:shadow-lg hover:border-maroon transition">
      <CardHeader className="flex-row items-center space-y-0 gap-4">
        <span className="relative">
          <Icon className="text-maroon group-hover:scale-110 transition h-8 w-8 shrink-0" />
          {showBadge && badgeCount && badgeCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-1.5 text-xs px-1.5 py-0.5"
            >
              {badgeCount}
            </Badge>
          )}
        </span>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
  if (link) {
    return (
      <a href={link} className="group block" tabIndex={0}>
        {content}
      </a>
    );
  }
  return (
    <div className="group cursor-pointer" tabIndex={0} onClick={onClick}>
      {content}
    </div>
  );
};
