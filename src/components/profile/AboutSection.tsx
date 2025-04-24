
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { User } from '@/types';

interface AboutSectionProps {
  currentUser: User;
  isEditing?: boolean;
  onRemoveTag?: (tag: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  currentUser, 
  isEditing = false,
  onRemoveTag 
}) => {
  return (
    <>
      {currentUser.bio && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">About Me</h3>
          <p className="text-gray-600">{currentUser.bio}</p>
        </div>
      )}
      
      {currentUser.tags && currentUser.tags.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Services Offered</h3>
          <div className="flex flex-wrap gap-1">
            {currentUser.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
                {isEditing && onRemoveTag && (
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onRemoveTag(tag)}
                  />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
