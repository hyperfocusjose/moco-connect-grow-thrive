
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { User } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileImageFieldProps {
  profileImage: string | null;
  member: User | null;
  onImageUploaded: (imageUrl: string) => void;
}

export const ProfileImageField: React.FC<ProfileImageFieldProps> = ({ 
  profileImage, 
  member, 
  onImageUploaded 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset states when a new URL is provided
  useEffect(() => {
    if (profileImage) {
      console.log("ProfileImageField received image URL:", profileImage);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [profileImage]);

  const handleImageUploaded = (imageUrl: string) => {
    console.log("Image uploaded in ProfileImageField:", imageUrl);
    
    // Pass it along to parent component
    onImageUploaded(imageUrl);
    
    // Reset error state
    setImageError(false);
  };

  const getInitials = () => {
    if (!member) return "NA";
    return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  };

  const handleImageLoad = () => {
    console.log("Avatar image loaded successfully");
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error("Error loading avatar image from URL:", profileImage);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {profileImage && !imageError ? (
            <AvatarImage 
              src={profileImage} 
              alt="Profile" 
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
          ) : (
            <AvatarFallback className="bg-maroon text-white text-xl">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <ProfilePicUpload onImageUploaded={handleImageUploaded} />
        
        {imageError && profileImage && (
          <Alert className="mt-4 max-w-xs text-red-600 bg-red-50 border-red-200">
            <AlertDescription>
              Unable to load image. The URL may be invalid or inaccessible.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
