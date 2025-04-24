
import React, { useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
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
  // Verify if the image in profileImage exists in the bucket
  useEffect(() => {
    const verifyImageExists = async () => {
      if (profileImage) {
        try {
          // Extract the path from the URL
          const filePathMatch = profileImage.match(/\/storage\/v1\/object\/public\/profiles\/(.+)/);
          if (filePathMatch && filePathMatch[1]) {
            const filePath = decodeURIComponent(filePathMatch[1]);
            
            // Check if file exists in bucket
            const { data } = await supabase.storage
              .from('profiles')
              .getPublicUrl(filePath);
              
            console.log('Generated public URL:', data.publicUrl);
          }
        } catch (error) {
          console.error('Error parsing profile image URL:', error);
        }
      }
    };
    
    verifyImageExists();
  }, [profileImage]);

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {profileImage ? (
            <AvatarImage 
              src={getCacheBustedImageUrl(profileImage)} 
              alt="Profile" 
              onError={(e) => {
                console.log("Image failed to load:", profileImage);
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
