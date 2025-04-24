
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';
import { toast } from 'sonner';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { cropImageWithCircle } from '@/utils/cropUtils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';

interface CropImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
}

export const CropImageModal: React.FC<CropImageModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
  onCropComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fabricCanvas, cropCircle, loading, imageError } = useFabricCanvas({
    canvasRef,
    imageUrl,
    isOpen
  });

  const handleCrop = () => {
    if (!fabricCanvas || !cropCircle) {
      toast.error("Missing required elements for cropping");
      return;
    }

    const croppedDataUrl = cropImageWithCircle(fabricCanvas, cropCircle);
    
    if (croppedDataUrl) {
      onCropComplete(croppedDataUrl);
      onClose();
      toast.success("Image cropped successfully");
    } else {
      toast.error("Error during image cropping");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogDescription>
            Drag the circle to position your profile picture. The area inside the circle will be used as your profile image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <LoadingSpinner />
            ) : imageError ? (
              <ErrorDisplay error={imageError} />
            ) : (
              <canvas ref={canvasRef} />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCrop} 
              disabled={loading || !fabricCanvas || !!imageError}
            >
              <Crop className="mr-2 h-4 w-4" />
              Crop & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
