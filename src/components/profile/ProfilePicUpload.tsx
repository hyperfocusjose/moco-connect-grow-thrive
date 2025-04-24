
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { ProfilePicUploadProps } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { CropImageModal } from './CropImageModal';

export const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({ onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const uploadImage = async (imageData: string) => {
    setIsUploading(true);
    try {
      console.log("Starting upload process with image data");
      
      // Convert base64 to blob
      const response = await fetch(imageData);
      
      if (!response.ok) {
        throw new Error("Failed to process image data");
      }
      
      const blob = await response.blob();
      console.log("Converted to blob:", blob.size, "bytes,", blob.type);
      
      const fileExt = 'png';
      const filePath = `${uuidv4()}.${fileExt}`;
      console.log("Will upload to path:", filePath);
      
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", data);
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      console.log("Generated public URL:", publicUrl);
      
      // Always use the fully qualified URL with domain
      const absoluteUrl = `https://fermfvwyoqewedrzgben.supabase.co/storage/v1/object/public/profiles/${filePath}`;
      console.log("Using absolute URL:", absoluteUrl);
      
      // Now update the user profile in the database to include this image URL
      const { data: authData } = await supabase.auth.getSession();
      if (authData.session?.user.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_picture: absoluteUrl })
          .eq('id', authData.session.user.id);
          
        if (updateError) {
          console.error("Error updating profile with new image URL:", updateError);
          toast.error("Failed to update profile with new image");
        } else {
          console.log("Profile updated successfully with new image URL");
        }
      }
      
      // Pass the URL back to parent component
      onImageUploaded(absoluteUrl);
      
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
      setShowCropModal(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size, "bytes");
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log("File read complete, data length:", result.length);
      setSelectedImage(result);
      setShowCropModal(true);
    };
    
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      toast.error('Error reading the selected file');
    };
    
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    console.log("Crop completed, starting upload");
    uploadImage(croppedImageUrl);
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
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-500" />
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

      <CropImageModal
        imageUrl={selectedImage || ''}
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
