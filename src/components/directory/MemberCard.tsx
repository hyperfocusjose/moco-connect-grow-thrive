
import React from 'react';
import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MemberCardProps {
  member: User;
  onClick: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onClick }) => {
  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.profilePicture} alt={member.firstName} />
          <AvatarFallback className="bg-maroon text-white">
            {getInitials(member.firstName, member.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">
              {member.firstName} {member.lastName}
            </h3>
            {member.isAdmin && (
              <Badge variant="outline" className="ml-2 text-xs border-maroon text-maroon">
                Admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{member.businessName}</p>
          <p className="text-xs text-muted-foreground truncate">{member.industry}</p>
        </div>
      </CardContent>
    </Card>
  );
};
