
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ProfileHeaderProps {
  currentUser: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ currentUser }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Reset image states when profile picture URL changes
  useEffect(() => {
    if (currentUser.profilePicture) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [currentUser.profilePicture]);
  
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
        {currentUser.profilePicture && !imageError ? (
          <AvatarImage 
            src={currentUser.profilePicture} 
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <AvatarFallback className="bg-maroon text-white text-3xl">
            {getInitials(currentUser.firstName, currentUser.lastName)}
          </AvatarFallback>
        )}
      </Avatar>
      
      {imageError && currentUser.profilePicture && (
        <Alert variant="destructive" className="mt-2 mb-4 max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Image Error</AlertTitle>
          <AlertDescription className="text-sm">
            Failed to load profile image. The URL may be invalid or inaccessible.
          </AlertDescription>
        </Alert>
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
