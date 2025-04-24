
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const uploadProfileImage = async (imageData: string) => {
  try {
    const response = await fetch(imageData);
    if (!response.ok) throw new Error("Failed to process image data");
    
    const blob = await response.blob();
    console.log("Converted to blob:", blob.size, "bytes,", blob.type);
    
    const fileExt = 'png';
    const filePath = `${uuidv4()}.${fileExt}`;
    console.log("Will upload to path:", filePath);
    
    const { error: uploadError, data } = await supabase.storage
      .from('profiles')
      .upload(filePath, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) throw uploadError;
    
    console.log("Upload successful:", data);
    
    // Use a forced CDN URL
    const cdnUrl = `https://fermfvwyoqewedrzgben.supabase.co/storage/v1/object/public/profiles/${filePath}`;
    
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session?.user.id) throw new Error("No user session found");
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_picture: cdnUrl })
      .eq('id', authData.session.user.id);
      
    if (updateError) throw updateError;
    
    console.log("Profile updated successfully with new image URL");
    return cdnUrl;
    
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
