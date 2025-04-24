
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface UploadButtonProps {
  isUploading: boolean;
  disabled: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  isUploading,
  disabled,
  onFileChange,
}) => (
  <Button 
    variant="outline" 
    size="sm"
    className="relative"
    disabled={disabled}
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
      onChange={onFileChange}
      disabled={disabled}
    />
  </Button>
);
