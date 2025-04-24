
import React, { useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { User } from '@/types';
import { getCacheBustedImageUrl, getInitials } from '@/utils/imageUtils';

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
  // Log the initial image URL for debugging
  useEffect(() => {
    console.log('ProfileImageField initialized with image URL:', profileImage);
  }, []);

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {profileImage ? (
            <AvatarImage 
              src={getCacheBustedImageUrl(profileImage)} 
              alt="Profile" 
              onError={(e) => {
                console.error("Image failed to load:", profileImage);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <AvatarFallback className="bg-maroon text-white text-xl">
              {getInitials(member?.firstName, member?.lastName)}
            </AvatarFallback>
          )}
        </Avatar>
        <ProfilePicUpload 
          onImageUploaded={(url) => {
            console.log("Image uploaded, new URL:", url);
            onImageUploaded(url);
          }} 
        />
      </div>
    </div>
  );
};
