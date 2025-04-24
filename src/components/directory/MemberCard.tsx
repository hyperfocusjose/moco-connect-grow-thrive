import React from 'react';
import { User } from '@/types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Globe, Linkedin, Instagram, Facebook, Edit } from 'lucide-react';
import { getCacheBustedImageUrl, getInitials } from '@/utils/imageUtils';

interface MemberCardProps {
  member: User;
  onClick: () => void;
  showEditButton?: boolean;
  onEdit?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onClick, 
  showEditButton = false, 
  onEdit 
}) => {
  // Handle edit button click without propagating to card click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  // Debug log the profile picture URL
  console.log(`MemberCard for ${member.firstName} ${member.lastName}:`, member.profilePicture);

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2 relative">
        {showEditButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </Button>
        )}
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            {member.profilePicture ? (
              <AvatarImage 
                src={getCacheBustedImageUrl(member.profilePicture)} 
                alt={`${member.firstName} ${member.lastName}`}
                onError={(e) => {
                  console.error("Card image failed to load:", member.profilePicture);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <AvatarFallback className="bg-maroon text-white text-xl">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center">
            <h3 className="font-semibold text-lg">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{member.businessName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex flex-wrap justify-center gap-1 mt-2 mb-4">
          <Badge variant="outline" className="text-xs border-maroon text-maroon">
            {member.industry}
          </Badge>
          {member.isAdmin && (
            <Badge variant="outline" className="text-xs border-maroon text-maroon">
              Admin
            </Badge>
          )}
        </div>
        
        {/* Social & Contact Links */}
        <div className="flex justify-center space-x-2 mt-2">
          {member.website && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Globe className="h-4 w-4 text-gray-600" />
            </Button>
          )}
          {member.linkedin && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Linkedin className="h-4 w-4 text-gray-600" />
            </Button>
          )}
          {member.facebook && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Facebook className="h-4 w-4 text-gray-600" />
            </Button>
          )}
          {member.tiktok && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                <path d="M15 2v10c0 4.418-3.582 8-8 8" />
              </svg>
            </Button>
          )}
          {member.instagram && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Instagram className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0 text-sm">
        <div className="flex items-center">
          <Phone className="h-3 w-3 mr-1 text-gray-500" />
          <span className="text-gray-600 text-xs">Contact</span>
        </div>
        <div className="flex items-center">
          <Mail className="h-3 w-3 mr-1 text-gray-500" />
          <span className="text-gray-600 text-xs">Email</span>
        </div>
      </CardFooter>
    </Card>
  );
};
