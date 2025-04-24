
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
