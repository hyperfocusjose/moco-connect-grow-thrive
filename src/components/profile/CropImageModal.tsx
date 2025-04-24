
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Canvas as FabricCanvas, Image as FabricImage, Circle as FabricCircle } from 'fabric';
import { Crop } from 'lucide-react';
import { toast } from 'sonner';

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
  const [imageError, setImageError] = useState<string | null>(null);

  // Create and initialize the canvas when the modal is opened
  useEffect(() => {
    if (!canvasRef.current || !isOpen || !imageUrl) return;
    
    setLoading(true);
    setImageError(null);
    
    try {
      console.log("Initializing canvas and loading image:", imageUrl);
      
      // Create a new fabric canvas
      const canvas = new FabricCanvas(canvasRef.current, {
        width: 400,
        height: 400,
        backgroundColor: '#f0f0f0',
        selection: false // Disable group selection
      });

      setFabricCanvas(canvas);
      
      // Load the image directly using fabric
      FabricImage.fromURL(imageUrl, (fabricImg) => {
        console.log("Image loaded via Fabric.js");
        
        // Scale image to fit canvas while maintaining aspect ratio
        const imgWidth = fabricImg.width || 0;
        const imgHeight = fabricImg.height || 0;
        
        if (imgWidth === 0 || imgHeight === 0) {
          setImageError("Invalid image dimensions");
          setLoading(false);
          return;
        }
        
        const scale = Math.min(
          380 / imgWidth,
          380 / imgHeight
        );
        
        fabricImg.scale(scale);
        fabricImg.set({
          left: (400 - imgWidth * scale) / 2,
          top: (400 - imgHeight * scale) / 2,
          selectable: false,  // Prevent the image from being moved
          originX: 'left',
          originY: 'top',
        });

        canvas.add(fabricImg);
        setOriginalImage(fabricImg);
        
        // Create circle crop mask
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
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'move',
          borderColor: 'white',
          cornerColor: 'white',
          transparentCorners: false
        });
        
        canvas.add(circle);
        canvas.bringToFront(circle);
        setCropCircle(circle);
        canvas.setActiveObject(circle);
        
        setLoading(false);
        canvas.renderAll();
      }, undefined, {
        crossOrigin: 'anonymous'
      });
      
      return () => {
        if (canvas) {
          canvas.dispose();
        }
      };
    } catch (error) {
      console.error("Error initializing canvas or loading image:", error);
      setImageError("An error occurred while setting up the image editor.");
      setLoading(false);
      toast.error("Error setting up image editor");
    }
  }, [imageUrl, isOpen]);

  const handleCrop = () => {
    if (!fabricCanvas || !originalImage || !cropCircle) {
      toast.error("Missing required elements for cropping");
      return;
    }

    try {
      // Get the coordinates from the crop circle
      const circle = cropCircle;
      const circleLeft = circle.left || 0;
      const circleTop = circle.top || 0;
      const radius = circle.radius || 150;
      
      console.log("Cropping with circle at:", circleLeft, circleTop, "radius:", radius);
      
      // Create a temporary canvas for cropping
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = radius * 2;
      tempCanvas.height = radius * 2;
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        console.error("Could not get 2D context for temporary canvas");
        toast.error("Error during image cropping");
        return;
      }
      
      // Draw the circle clip path
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Render the image to a canvas element
      const imgCanvas = fabricCanvas.toCanvasElement();
      
      // Draw the cropped portion to the temp canvas
      ctx.drawImage(
        imgCanvas,
        circleLeft - radius, 
        circleTop - radius,
        radius * 2,
        radius * 2,
        0,
        0,
        radius * 2,
        radius * 2
      );
      
      // Get the data URL from the temp canvas
      const croppedDataUrl = tempCanvas.toDataURL('image/png');
      
      onCropComplete(croppedDataUrl);
      onClose();
      toast.success("Image cropped successfully");
    } catch (error) {
      console.error("Error during image cropping:", error);
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
              <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-maroon"></div>
              </div>
            ) : imageError ? (
              <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 flex-col p-4">
                <p className="text-red-500 text-center mb-2">{imageError}</p>
                <p className="text-gray-500 text-sm text-center mb-2">Try uploading a different image or refreshing the page.</p>
              </div>
            ) : (
              <canvas ref={canvasRef} />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCrop} disabled={loading || !originalImage || !!imageError}>
              <Crop className="mr-2 h-4 w-4" />
              Crop & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
