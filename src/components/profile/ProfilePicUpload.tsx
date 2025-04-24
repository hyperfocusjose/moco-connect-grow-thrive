
import React, { useState } from 'react';
import { ProfilePicUploadProps } from '@/types';
import { toast } from 'sonner';
import { CropImageModal } from './CropImageModal';
import { UploadButton } from './UploadButton';
import { useStorageBucket } from '@/hooks/useStorageBucket';
import { uploadProfileImage } from '@/utils/imageUpload';

export const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({ onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  
  const { bucketReady, checkingBucket } = useStorageBucket('profiles');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size, "bytes");
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        console.log("File read complete, opening crop modal");
        setSelectedImage(event.target.result);
        setShowCropModal(true);
      } else {
        console.error("Failed to read file as DataURL");
        toast.error("Failed to read selected file");
      }
    };
    
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      toast.error('Error reading the selected file');
    };
    
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    console.log("Crop completed, starting upload");
    setIsUploading(true);
    try {
      const imageUrl = await uploadProfileImage(croppedImageUrl);
      onImageUploaded(imageUrl);
      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
      setShowCropModal(false);
    }
  };

  return (
    <div className="text-center">
      <UploadButton 
        isUploading={isUploading}
        disabled={isUploading || checkingBucket || !bucketReady}
        onFileChange={handleFileChange}
      />

      {checkingBucket && (
        <div className="text-xs text-gray-600 mt-1">
          Checking image storage...
        </div>
      )}
      
      {!checkingBucket && !bucketReady && (
        <div className="text-xs text-amber-600 mt-1">
          Storage not accessible
        </div>
      )}

      <CropImageModal
        imageUrl={selectedImage || ''}
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
