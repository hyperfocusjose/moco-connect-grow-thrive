
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { ProfilePicUploadProps } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({ onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { currentUser, updateCurrentUser } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${uuidv4()}.${fileExt}`;
      
      console.log("Starting upload to Supabase...");
      
      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '0',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      console.log("Upload successful:", data);
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      console.log("Public URL generated:", publicUrl);
      
      // CRITICAL FIX: Immediately update the user's profile in the database
      if (currentUser?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_picture: publicUrl })
          .eq('id', currentUser.id);
          
        if (updateError) {
          console.error("Failed to update profile with new image:", updateError);
          toast.error('Failed to update profile with new image');
        } else {
          console.log("Profile updated with new image URL:", publicUrl);
          
          // Update the current user in context with the new profile picture
          if (currentUser) {
            const updatedUser = { 
              ...currentUser, 
              profilePicture: publicUrl 
            };
            await updateCurrentUser(updatedUser);
          }
        }
      }
      
      // Pass the URL back to parent component
      onImageUploaded(publicUrl);
      
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="text-center">
      <Button 
        variant="outline" 
        size="sm"
        className="relative"
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-500"></div>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Change Photo
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </Button>
    </div>
  );
};
