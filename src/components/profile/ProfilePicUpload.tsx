
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { ProfilePicUploadProps } from '@/types';

export const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({ onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate file upload with loading state
    setIsUploading(true);
    try {
      // In a real app, you would upload to storage service
      // For demo purposes, we'll use a timeout and mock URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock URL - in real app, this would be the uploaded file URL
      const mockImageUrl = `/images/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.png`;
      
      // Pass the URL back to parent component
      onImageUploaded(mockImageUrl);
      
    } catch (error) {
      console.error('Error uploading image:', error);
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
