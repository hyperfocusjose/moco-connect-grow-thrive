
/**
 * Adds a cache-busting parameter to an image URL to prevent caching issues
 * @param url The original image URL
 * @returns The URL with a cache-busting timestamp parameter
 */
export const getCacheBustedImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // Skip if the URL already has our timestamp parameter
  if (url.includes('t=') && /t=[0-9]+/.test(url)) {
    return url;
  }
  
  // Add a timestamp parameter to prevent caching issues
  const timestamp = new Date().getTime();
  // Check if the URL already has query parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${timestamp}`;
};

/**
 * Extracts the initials from a user's name
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @returns The user's initials (first letter of first and last name)
 */
export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName || !lastName) return "NA";
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};
