
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfilePicUploadProps {
  profilePicture?: string;
  onUpdateProfilePicture: (imageUrl: string) => void;
}

export const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({
  profilePicture,
  onUpdateProfilePicture
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  const getInitials = () => {
    if (!currentUser) return 'U';
    return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate file upload for now
    // In a real app, this would upload to a storage service
    setTimeout(() => {
      // Create a data URL from the file
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateProfilePicture(reader.result);
          toast({
            title: "Success",
            description: "Profile picture updated successfully",
          });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage src={profilePicture} alt={currentUser?.firstName} />
        <AvatarFallback className="bg-maroon text-white text-xl">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <label htmlFor="profile-pic-upload">
        <div 
          className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
          title="Change profile picture"
        >
          <ImagePlus className="h-5 w-5 text-maroon" />
        </div>
        <input 
          id="profile-pic-upload" 
          type="file" 
          accept="image/*" 
          className="sr-only"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
      </label>
      
      {isUploading && (
        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      )}
    </div>
  );
};
