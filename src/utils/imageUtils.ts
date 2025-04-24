
/**
 * Adds a cache-busting parameter to an image URL to prevent caching issues
 * @param url The original image URL
 * @returns The URL with a cache-busting timestamp parameter
 */
export const getCacheBustedImageUrl = (url: string | null): string | null => {
  if (!url) {
    return null;
  }
  
  try {
    // Clean up the URL
    let cleanUrl = url.trim();
    
    // Add a timestamp parameter to prevent caching issues
    const timestamp = new Date().getTime();
    // Check if the URL already has query parameters
    const separator = cleanUrl.includes('?') ? '&' : '?';
    
    return `${cleanUrl}${separator}t=${timestamp}`;
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
    // Basic URL validation - just checking if it's a well-formed URL
    new URL(url);
    return true;
  } catch (e) {
    console.error('Invalid URL in isValidImageUrl:', url);
    return false;
  }
};

/**
 * Lightweight function to check if an image URL exists and is accessible
 * @param url The image URL to validate
 * @returns Promise that resolves to boolean indicating if the URL is accessible
 */
export const validateImageUrl = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
  }
};
