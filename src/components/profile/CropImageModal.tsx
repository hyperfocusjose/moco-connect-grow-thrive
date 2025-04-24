
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Canvas as FabricCanvas, Image as FabricImage, Circle as FabricCircle } from 'fabric';
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
  const [cropCircle, setCropCircle] = useState<FabricCircle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !isOpen || !imageUrl) return;
    
    setLoading(true);
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: '#f0f0f0',
      selection: false // Disable group selection
    });

    setFabricCanvas(canvas);

    // Load the image with crossOrigin enabled
    FabricImage.fromURL(
      imageUrl, 
      (img) => {
        if (!img) {
          console.error("Failed to load the image");
          setLoading(false);
          return;
        }

        // Scale image to fit canvas while maintaining aspect ratio
        const scale = Math.min(
          400 / img.width!,
          400 / img.height!
        );
        
        img.scale(scale);
        img.set({
          left: (400 - img.width! * scale) / 2,
          top: (400 - img.height! * scale) / 2,
          selectable: false,  // Prevent the image from being moved
          crossOrigin: 'anonymous'
        });

        canvas.add(img);
        setOriginalImage(img);

        // Create circle crop mask with clear visual indication
        const radius = 150;
        const circle = new FabricCircle({
          left: (400 - radius * 2) / 2,
          top: (400 - radius * 2) / 2,
          radius: radius,
          fill: 'transparent',
          stroke: '#ffffff',
          strokeWidth: 3,
          strokeDashArray: [5, 5],
          selectable: true,
          hasControls: false,  // No resize controls
          hasBorders: false,
          hoverCursor: 'move',
          borderColor: 'white',
          cornerColor: 'white',
          transparentCorners: false
        });
        
        canvas.add(circle);
        canvas.bringToFront(circle);
        setCropCircle(circle);
        
        // Make the circle the active object so it's immediately obvious it can be moved
        canvas.setActiveObject(circle);
        
        setLoading(false);
        canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );

    return () => {
      canvas.dispose();
    };
  }, [imageUrl, isOpen]);

  const handleCrop = () => {
    if (!fabricCanvas || !originalImage || !cropCircle) return;

    // Get the coordinates from the crop circle
    const circle = cropCircle;
    const circleLeft = circle.left || 0;
    const circleTop = circle.top || 0;
    const radius = circle.radius || 150;
    
    // Create a temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = radius * 2;
    tempCanvas.height = radius * 2;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw the circle clip path
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Create a new image element for drawing
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    
    // Wait for the image to load before drawing
    img.onload = () => {
      // Calculate the source coordinates in the original image
      const imgLeft = originalImage.left || 0;
      const imgTop = originalImage.top || 0;
      const imgScale = originalImage.scaleX || 1;
      
      // Draw the image at the correct position
      ctx.drawImage(
        img,
        (circleLeft - imgLeft) / imgScale,
        (circleTop - imgTop) / imgScale,
        (radius * 2) / imgScale,
        (radius * 2) / imgScale,
        0,
        0,
        radius * 2,
        radius * 2
      );
      
      // Get the data URL from the temp canvas
      const croppedDataUrl = tempCanvas.toDataURL('image/png');
      
      onCropComplete(croppedDataUrl);
      onClose();
    };
    
    img.onerror = () => {
      console.error("Failed to load image for cropping");
    };
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
              <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-maroon"></div>
              </div>
            ) : (
              <canvas ref={canvasRef} />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCrop} disabled={loading || !originalImage}>
              <Crop className="mr-2 h-4 w-4" />
              Crop & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
