
import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ReferralForm } from '@/components/forms/ReferralForm';
import { OneToOneForm } from '@/components/forms/OneToOneForm';
import { TYFCBForm } from '@/components/forms/TYFCBForm';
import { Phone, Mail, ArrowUpRight, ListCheck, Calendar, Globe, Linkedin, Facebook, Instagram, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getCacheBustedImageUrl, getInitials, validateImageUrl } from '@/utils/imageUtils';

interface MemberDetailProps {
  member: User;
  onClose: () => void;
  onEdit?: () => void;
}

export const MemberDetail: React.FC<MemberDetailProps> = ({ member, onClose, onEdit }) => {
  const [openForm, setOpenForm] = useState<null | 'referral' | '1to1' | 'tyfcb'>(null);
  const [imageValid, setImageValid] = useState<boolean | null>(null);
  const { currentUser } = useAuth();
  const isAdmin = !!currentUser?.isAdmin;
  const cachedImageUrl = member.profilePicture ? getCacheBustedImageUrl(member.profilePicture) : null;

  // Validate image URL when it changes
  useEffect(() => {
    const validateImage = async () => {
      if (!cachedImageUrl) {
        setImageValid(false);
        return;
      }
      
      console.log('Validating image URL in MemberDetail:', cachedImageUrl);
      const isValid = await validateImageUrl(cachedImageUrl);
      setImageValid(isValid);
      
      if (!isValid) {
        console.error('Invalid image URL in MemberDetail:', cachedImageUrl);
      }
    };
    
    validateImage();
  }, [cachedImageUrl]);

  const closeForm = () => setOpenForm(null);
  
  // Debug log
  useEffect(() => {
    console.log(`MemberDetail rendering for ${member.firstName} ${member.lastName}:`, {
      originalUrl: member.profilePicture,
      processedUrl: cachedImageUrl,
      isValid: imageValid,
      isAdmin: isAdmin
    });
  }, [member, cachedImageUrl, imageValid, isAdmin]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <ScrollArea className="h-[80vh] pr-4">
        <div className="flex flex-col items-center mb-6 relative">
          {isAdmin && onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-0 right-0 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 text-gray-600" />
            </Button>
          )}
          
          <Avatar className="h-24 w-24 mb-4">
            {(cachedImageUrl && imageValid) ? (
              <AvatarImage 
                src={cachedImageUrl} 
                alt={member.firstName}
                onError={(e) => {
                  console.log("Detail image failed to load:", cachedImageUrl);
                  setImageValid(false);
                  e.currentTarget.style.display = 'none';
                }} 
              />
            ) : (
              <AvatarFallback className="bg-maroon text-white text-xl">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="text-2xl font-bold text-center">
            {member.firstName} {member.lastName}
          </h2>
          <p className="text-muted-foreground text-center">{member.businessName}</p>

          <div className="flex items-center mt-2">
            <Badge variant="outline" className="text-xs border-maroon text-maroon">
              {member.industry}
            </Badge>
            {member.isAdmin && (
              <Badge variant="outline" className="ml-2 text-xs border-maroon text-maroon">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Social Media Links */}
        {(member.website || member.linkedin || member.facebook || member.tiktok || member.instagram) && (
          <div className="flex justify-center space-x-3 mb-6">
            {member.website && (
              <a href={ensureHttps(member.website)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Globe className="h-4 w-4 text-gray-600" />
                </Button>
              </a>
            )}
            {member.linkedin && (
              <a href={getLinkedInUrl(member.linkedin)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="h-4 w-4 text-blue-600" />
                </Button>
              </a>
            )}
            {member.facebook && (
              <a href={getFacebookUrl(member.facebook)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="h-4 w-4 text-blue-600" />
                </Button>
              </a>
            )}
            {member.tiktok && (
              <a href={getTikTokUrl(member.tiktok)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                    <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                    <path d="M15 2v10c0 4.418-3.582 8-8 8" />
                  </svg>
                </Button>
              </a>
            )}
            {member.instagram && (
              <a href={getInstagramUrl(member.instagram)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Instagram className="h-4 w-4 text-pink-600" />
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Contact Info - iPhone-like layout */}
        <div className="space-y-5 mb-6">
          <a
            href={`tel:${member.phoneNumber}`}
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="mr-3 p-2 bg-green-100 rounded-full">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium">phone</div>
              <div className="text-lg">{member.phoneNumber}</div>
            </div>
          </a>

          <a
            href={`mailto:${member.email}`}
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="mr-3 p-2 bg-blue-100 rounded-full">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium">email</div>
              <div className="text-lg">{member.email}</div>
            </div>
          </a>
          
          {member.website && (
            <a
              href={ensureHttps(member.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="mr-3 p-2 bg-purple-100 rounded-full">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium">website</div>
                <div className="text-lg truncate max-w-[200px]">{member.website}</div>
              </div>
            </a>
          )}
        </div>

        <Separator className="my-6" />

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">About</h3>
          <p className="text-sm text-muted-foreground">
            {member.bio || "No bio provided."}
          </p>
        </div>

        {/* Tags */}
        {member.tags && member.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Services Offered</h3>
            <div className="flex flex-wrap gap-1">
              {member.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Actions */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-medium mb-2">Actions</h3>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setOpenForm('referral')}
          >
            <ArrowUpRight className="mr-2 h-4 w-4 text-green-600" />
            Make Referral
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setOpenForm('1to1')}
          >
            <ListCheck className="mr-2 h-4 w-4 text-orange-600" />
            Record One-to-One
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setOpenForm('tyfcb')}
          >
            <Calendar className="mr-2 h-4 w-4 text-purple-600" />
            Record Closed Business
          </Button>
        </div>
      </ScrollArea>

      {/* Input Forms as Dialogs */}
      <Dialog open={!!openForm} onOpenChange={val => { if (!val) closeForm(); }}>
        <DialogContent
          className="sm:max-w-md p-0"
          onInteractOutside={e => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            {openForm === 'referral' ? 'Make Referral' : 
             openForm === '1to1' ? 'Record One-to-One' : 
             openForm === 'tyfcb' ? 'Record Closed Business' : ''}
          </DialogTitle>
          
          {openForm === 'referral' && (
            <ReferralForm
              onComplete={() => { closeForm(); onClose(); }}
              forceShowInputMemberSelect={isAdmin}
              preselectedMember={member}
            />
          )}
          {openForm === '1to1' && (
            <OneToOneForm
              onComplete={() => { closeForm(); onClose(); }}
              forceShowInputMemberSelect={isAdmin}
              preselectedMember={member}
            />
          )}
          {openForm === 'tyfcb' && (
            <TYFCBForm
              onComplete={() => { closeForm(); onClose(); }}
              forceShowInputMemberSelect={isAdmin}
              preselectedMember={member}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper functions for URLs
function ensureHttps(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

function getLinkedInUrl(username: string): string {
  return username.startsWith('http') ? username : `https://linkedin.com/in/${username.replace(/^@/, '')}`;
}

function getFacebookUrl(username: string): string {
  return username.startsWith('http') ? username : `https://facebook.com/${username.replace(/^@/, '')}`;
}

function getTikTokUrl(username: string): string {
  return username.startsWith('http') ? username : `https://tiktok.com/@${username.replace(/^@/, '')}`;
}

function getInstagramUrl(username: string): string {
  return username.startsWith('http') ? username : `https://instagram.com/${username.replace(/^@/, '')}`;
}
