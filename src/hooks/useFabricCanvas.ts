
import { useEffect, useState } from 'react';
import { Canvas as FabricCanvas, Image as FabricImage, Circle as FabricCircle } from 'fabric';

interface UseFabricCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageUrl: string;
  isOpen: boolean;
}

export const useFabricCanvas = ({ canvasRef, imageUrl, isOpen }: UseFabricCanvasProps) => {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);
  const [cropCircle, setCropCircle] = useState<FabricCircle | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !isOpen || !imageUrl) return;
    
    setLoading(true);
    setImageError(null);
    
    try {
      console.log("Initializing canvas and loading image:", imageUrl);
      
      const canvas = new FabricCanvas(canvasRef.current, {
        width: 400,
        height: 400,
        backgroundColor: '#f0f0f0',
        selection: false
      });

      setFabricCanvas(canvas);
      
      FabricImage.fromURL(imageUrl, (fabricImg) => {
        console.log("Image loaded via Fabric.js");
        
        const imgWidth = fabricImg.width || 0;
        const imgHeight = fabricImg.height || 0;
        
        if (imgWidth === 0 || imgHeight === 0) {
          setImageError("Invalid image dimensions");
          setLoading(false);
          return;
        }
        
        const scale = Math.min(380 / imgWidth, 380 / imgHeight);
        
        fabricImg.scale(scale);
        fabricImg.set({
          left: (400 - imgWidth * scale) / 2,
          top: (400 - imgHeight * scale) / 2,
          selectable: false,
          originX: 'left',
          originY: 'top',
        });

        canvas.add(fabricImg);
        setOriginalImage(fabricImg);
        
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
        canvas.dispose();
      };
    } catch (error) {
      console.error("Error initializing canvas or loading image:", error);
      setImageError("An error occurred while setting up the image editor.");
      setLoading(false);
    }
  }, [imageUrl, isOpen]);

  return {
    fabricCanvas,
    originalImage,
    cropCircle,
    loading,
    imageError
  };
};
