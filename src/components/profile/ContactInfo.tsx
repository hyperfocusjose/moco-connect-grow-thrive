
import React from 'react';
import { Phone, Mail, Globe, Linkedin, Facebook, Instagram } from 'lucide-react';
import { User } from '@/types';

interface ContactInfoProps {
  currentUser: User;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ currentUser }) => {
  const ensureHttps = (url: string): string => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const getLinkedInUrl = (username: string): string => {
    if (!username) return '';
    return username.startsWith('http') ? username : `https://linkedin.com/in/${username.replace(/^@/, '')}`;
  };

  const getFacebookUrl = (username: string): string => {
    if (!username) return '';
    return username.startsWith('http') ? username : `https://facebook.com/${username.replace(/^@/, '')}`;
  };

  const getInstagramUrl = (username: string): string => {
    if (!username) return '';
    return username.startsWith('http') ? username : `https://instagram.com/${username.replace(/^@/, '')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Phone className="h-5 w-5 text-gray-500 mr-3" />
        <div>
          <div className="text-sm text-gray-500">Phone</div>
          <div>{currentUser.phoneNumber}</div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Mail className="h-5 w-5 text-gray-500 mr-3" />
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div>{currentUser.email}</div>
        </div>
      </div>
      
      {currentUser.website && (
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-gray-500 mr-3" />
          <div>
            <div className="text-sm text-gray-500">Website</div>
            <a 
              href={ensureHttps(currentUser.website)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {currentUser.website}
            </a>
          </div>
        </div>
      )}
      
      {(currentUser.linkedin || currentUser.facebook || currentUser.instagram) && (
        <div className="flex space-x-3 mt-4">
          {currentUser.linkedin && (
            <a 
              href={getLinkedInUrl(currentUser.linkedin)}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {currentUser.facebook && (
            <a 
              href={getFacebookUrl(currentUser.facebook)}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}
          {currentUser.instagram && (
            <a 
              href={getInstagramUrl(currentUser.instagram)}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
