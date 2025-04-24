
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

interface ProfileHeaderProps {
  currentUser: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ currentUser }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <Avatar className="h-32 w-32 mb-4">
        {currentUser.profilePicture ? (
          <AvatarImage 
            src={currentUser.profilePicture} 
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <AvatarFallback className="bg-maroon text-white text-3xl">
          {getInitials(currentUser.firstName, currentUser.lastName)}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold text-center">
        {currentUser.firstName} {currentUser.lastName}
      </h2>
      <p className="text-gray-500 text-center">{currentUser.businessName}</p>
      <div className="mt-2">
        <Badge variant="outline" className="border-maroon text-maroon">
          {currentUser.industry}
        </Badge>
        {currentUser.isAdmin && (
          <Badge variant="outline" className="ml-2 border-maroon text-maroon">
            Admin
          </Badge>
        )}
      </div>
    </div>
  );
};
