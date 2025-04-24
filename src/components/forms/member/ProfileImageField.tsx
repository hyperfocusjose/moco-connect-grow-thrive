
import React, { useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { User } from '@/types';

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
  // Log when the component receives a new profile image
  useEffect(() => {
    if (profileImage) {
      console.log("ProfileImageField received image URL:", profileImage);
    }
  }, [profileImage]);

  const handleImageUploaded = (imageUrl: string) => {
    console.log("Image uploaded in ProfileImageField:", imageUrl);
    onImageUploaded(imageUrl);
  };

  const getInitials = () => {
    if (!member) return "NA";
    return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {profileImage ? (
            <AvatarImage 
              src={profileImage} 
              alt="Profile" 
              onError={(e) => {
                console.error("Error loading avatar image:", e);
                // Fall back to initials
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <AvatarFallback className="bg-maroon text-white text-xl">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <ProfilePicUpload onImageUploaded={handleImageUploaded} />
        {profileImage && (
          <div className="mt-2 text-xs text-gray-500 max-w-xs break-words">
            Image URL: {profileImage}
          </div>
        )}
      </div>
    </div>
  );
};
