
/**
 * Adds a cache-busting parameter to an image URL to prevent caching issues
 * @param url The original image URL
 * @returns The URL with a cache-busting timestamp parameter
 */
export const getCacheBustedImageUrl = (url: string | null): string | null => {
  if (!url) {
    console.debug('No URL provided to getCacheBustedImageUrl');
    return null;
  }
  
  try {
    // Clean up the URL if needed
    let cleanUrl = url.trim();
    
    // Skip if the URL already has our timestamp parameter
    if (cleanUrl.includes('t=') && /t=[0-9]+/.test(cleanUrl)) {
      console.debug('URL already has timestamp:', cleanUrl);
      return cleanUrl;
    }
    
    // Add a timestamp parameter to prevent caching issues
    const timestamp = new Date().getTime();
    // Check if the URL already has query parameters
    const separator = cleanUrl.includes('?') ? '&' : '?';
    
    const result = `${cleanUrl}${separator}t=${timestamp}`;
    console.debug('Generated cache-busted URL:', {
      original: cleanUrl,
      modified: result
    });
    return result;
  } catch (error) {
    console.error('Error in getCacheBustedImageUrl:', error);
    return url;
  }
};

/**
 * Extracts the initials from a user's name
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @returns The user's initials (first letter of first and last name)
 */
export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return "NA";
  
  let initials = '';
  if (firstName && firstName.length > 0) {
    initials += firstName[0].toUpperCase();
  }
  
  if (lastName && lastName.length > 0) {
    initials += lastName[0].toUpperCase();
  }
  
  return initials || "NA";
};

/**
 * Validate if a URL is a valid image URL
 * @param url The URL to validate
 * @returns Boolean indicating if the URL is a valid image URL
 */
export const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  
  try {
    // Basic URL validation
    const parsed = new URL(url);
    
    // Check if it's from known image hosts or has image extensions
    const isImageExtension = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(parsed.pathname);
    const isSupabaseStorage = parsed.hostname.includes('supabase.co') && parsed.pathname.includes('storage/v1');
    
    return isImageExtension || isSupabaseStorage;
  } catch (e) {
    console.error('Invalid URL in isValidImageUrl:', url);
    return false;
  }
};

/**
 * Validates that a URL is accessible and returns a valid image
 * @param url The image URL to validate
 * @returns Promise that resolves to boolean indicating if the URL returns a valid image
 */
export const validateImageUrl = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => {
      console.error('Image failed to load:', url);
      resolve(false);
    };
    img.src = url;
  });
};
