
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { User } from '@/types';
import { getCacheBustedImageUrl, getInitials, validateImageUrl } from '@/utils/imageUtils';

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
  const [imageValid, setImageValid] = useState<boolean | null>(null);
  const cachedImageUrl = profileImage ? getCacheBustedImageUrl(profileImage) : null;
  
  // Validate the image URL when it changes
  useEffect(() => {
    const validateImage = async () => {
      if (!cachedImageUrl) {
        setImageValid(false);
        return;
      }
      
      console.log('Validating image URL:', cachedImageUrl);
      const isValid = await validateImageUrl(cachedImageUrl);
      setImageValid(isValid);
      
      if (!isValid) {
        console.error('Invalid image URL:', cachedImageUrl);
      }
    };
    
    validateImage();
  }, [cachedImageUrl]);
  
  // Log image state for debugging
  useEffect(() => {
    console.log('ProfileImageField state:', {
      originalUrl: profileImage,
      cachedUrl: cachedImageUrl,
      isValid: imageValid,
      member: member ? `${member.firstName} ${member.lastName}` : 'none'
    });
  }, [profileImage, cachedImageUrl, imageValid, member]);

  return (
    <div className="mb-6 flex justify-center">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-2">
          {(cachedImageUrl && imageValid) ? (
            <AvatarImage 
              src={cachedImageUrl} 
              alt="Profile" 
              onError={(e) => {
                console.error("Profile image failed to load:", cachedImageUrl);
                setImageValid(false);
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
            setImageValid(null); // Reset validation state
            onImageUploaded(url);
          }} 
        />
      </div>
    </div>
  );
};
