
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { User } from '@/types';
import { toast } from 'sonner';

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

  // Log when the component receives a new profile image
  useEffect(() => {
    if (profileImage) {
      console.log("ProfileImageField received image URL:", profileImage);
      // Reset states when a new URL is provided
      setImageLoaded(false);
      setImageError(false);
    }
  }, [profileImage]);

  const handleImageUploaded = (imageUrl: string) => {
    console.log("Image uploaded in ProfileImageField:", imageUrl);
    
    // Verify the URL format
    if (!imageUrl.startsWith('http')) {
      console.error("Invalid image URL format:", imageUrl);
      toast.error("Invalid image URL format");
      return;
    }
    
    // Test if the image is accessible
    const testImg = new Image();
    testImg.onload = () => {
      console.log("Test image loaded successfully from URL:", imageUrl);
      onImageUploaded(imageUrl);
    };
    testImg.onerror = () => {
      console.error("Failed to load test image from URL:", imageUrl);
      toast.error("Image URL appears to be inaccessible");
      onImageUploaded(imageUrl); // Still pass it along, but with a warning
    };
    testImg.src = imageUrl;
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Error loading avatar image:", e);
    setImageError(true);
    setImageLoaded(false);
    // Fall back to initials
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {profileImage ? (
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
          {profileImage && imageError && (
            <AvatarFallback className="bg-maroon text-white text-xl">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <ProfilePicUpload onImageUploaded={handleImageUploaded} />
        
        {profileImage && (
          <div className="mt-2 text-xs text-gray-500 max-w-xs break-words">
            <div className={imageLoaded ? "text-green-600" : "text-red-600"}>
              Status: {imageLoaded ? "Loaded ✓" : imageError ? "Error loading image ✗" : "Loading..."}
            </div>
            Image URL: {profileImage}
          </div>
        )}
        
        {imageError && profileImage && (
          <div className="mt-1 text-xs text-red-500">
            Tip: Check if the URL is accessible and CORS settings are correct
          </div>
        )}
      </div>
    </div>
  );
};
