
import React, { useEffect, useState } from 'react';
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
  const [imageKey, setImageKey] = useState<number>(Date.now());
  const cachedImageUrl = profileImage ? getCacheBustedImageUrl(profileImage) : null;
  
  // Reset image key when profile image changes
  useEffect(() => {
    setImageKey(Date.now());
  }, [profileImage]);

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {cachedImageUrl ? (
            <AvatarImage 
              key={imageKey}
              src={cachedImageUrl} 
              alt="Profile" 
              onError={() => {
                console.error("Profile image failed to load:", cachedImageUrl);
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
