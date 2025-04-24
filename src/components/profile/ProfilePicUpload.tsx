
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { ProfilePicUploadProps } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({ onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${uuidv4()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
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
