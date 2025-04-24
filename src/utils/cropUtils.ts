
import { Canvas as FabricCanvas, Image as FabricImage, Circle as FabricCircle } from 'fabric';

export const cropImageWithCircle = (
  fabricCanvas: FabricCanvas,
  circle: FabricCircle,
): string | null => {
  try {
    const circleLeft = circle.left || 0;
    const circleTop = circle.top || 0;
    const radius = circle.radius || 150;
    
    console.log("Cropping with circle at:", circleLeft, circleTop, "radius:", radius);
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = radius * 2;
    tempCanvas.height = radius * 2;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) {
      console.error("Could not get 2D context for temporary canvas");
      return null;
    }
    
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    const imgCanvas = fabricCanvas.toCanvasElement();
    
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
    
    return tempCanvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error during image cropping:", error);
    return null;
  }
};
