
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStorageBucket = (bucketName: string) => {
  const [bucketReady, setBucketReady] = useState(false);
  const [checkingBucket, setCheckingBucket] = useState(true);

  useEffect(() => {
    const checkBucketAccess = async () => {
      try {
        console.log(`Checking if ${bucketName} storage bucket exists and is accessible...`);
        setCheckingBucket(true);
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (error) {
          console.error(`Error accessing ${bucketName} bucket:`, error.message);
          setBucketReady(false);
          if (error.message.includes("The resource was not found")) {
            toast.error("Storage bucket for profile images not found");
          } else {
            toast.error("Cannot access profile storage");
          }
        } else {
          console.log(`Successfully accessed ${bucketName} bucket with data:`, data);
          setBucketReady(true);
        }
      } catch (error) {
        console.error("Unexpected error checking bucket access:", error);
        setBucketReady(false);
        toast.error("Failed to access profile image storage");
      } finally {
        setCheckingBucket(false);
      }
    };
    
    checkBucketAccess();
  }, [bucketName]);

  return { bucketReady, checkingBucket };
};
