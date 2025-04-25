
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { User } from '@/types';
import { getInitials } from '@/utils/imageUtils';

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
  const [imageError, setImageError] = useState(false);
  
  // Log state for debugging
  React.useEffect(() => {
    console.log('ProfileImageField rendering with:', {
      profileImage,
      memberName: member ? `${member.firstName} ${member.lastName}` : 'none'
    });
  }, [profileImage, member]);

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {(profileImage && !imageError) ? (
            <AvatarImage 
              src={profileImage} 
              alt="Profile" 
              onError={(e) => {
                console.error("Profile image failed to load:", profileImage);
                setImageError(true);
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
            setImageError(false); // Reset error state on new upload
            onImageUploaded(url);
          }} 
        />
      </div>
    </div>
  );
};
