
import React from 'react';
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
  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          <AvatarImage src={profileImage || ""} />
          <AvatarFallback className="bg-maroon text-white text-xl">
            {member ? `${member.firstName[0]}${member.lastName[0]}`.toUpperCase() : "NA"}
          </AvatarFallback>
        </Avatar>
        <ProfilePicUpload onImageUploaded={onImageUploaded} />
      </div>
    </div>
  );
};
