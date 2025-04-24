
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { toast } from 'sonner';

interface ProfileHeaderProps {
  currentUser: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ currentUser }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleImageLoad = () => {
    console.log("Profile Header: Avatar image loaded successfully");
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Profile Header: Error loading avatar image:", e);
    console.error("Failed image URL:", currentUser.profilePicture);
    setImageError(true);
    setImageLoaded(false);
  };

  // Log the profile picture URL for debugging
  console.log("ProfileHeader rendering with profilePicture:", currentUser.profilePicture);
  
  return (
    <div className="flex flex-col items-center mb-6">
      <Avatar className="h-32 w-32 mb-4">
        {currentUser.profilePicture ? (
          <AvatarImage 
            src={currentUser.profilePicture} 
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : null}
        <AvatarFallback className="bg-maroon text-white text-3xl">
          {getInitials(currentUser.firstName, currentUser.lastName)}
        </AvatarFallback>
      </Avatar>
      
      {currentUser.profilePicture && imageError && (
        <div className="mt-2 text-xs text-red-500 text-center">
          <p>Failed to load image</p>
          <p className="text-gray-500 break-all">{currentUser.profilePicture}</p>
        </div>
      )}
      
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
