
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Canvas as FabricCanvas, Image as FabricImage } from 'fabric';
import { Crop } from 'lucide-react';

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
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: '#f0f0f0',
    });

    setFabricCanvas(canvas);

    // Load the image
    FabricImage.fromURL(imageUrl, (img) => {
      // Scale image to fit canvas while maintaining aspect ratio
      const scale = Math.min(
        400 / img.width!,
        400 / img.height!
      );
      
      img.scale(scale);
      img.set({
        left: (400 - img.width! * scale) / 2,
        top: (400 - img.height! * scale) / 2,
      });

      canvas.add(img);
      canvas.centerObject(img);
      setOriginalImage(img);
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
    };
  }, [imageUrl, isOpen]);

  const handleCrop = () => {
    if (!fabricCanvas || !originalImage) return;

    // Get the cropped data URL
    const croppedDataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
    });

    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="border rounded-lg overflow-hidden">
            <canvas ref={canvasRef} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCrop}>
              <Crop className="mr-2 h-4 w-4" />
              Crop & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
