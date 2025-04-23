
import React from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ReferralForm } from '@/components/forms/ReferralForm';
import { OneToOneForm } from '@/components/forms/OneToOneForm';
import { TYFCBForm } from '@/components/forms/TYFCBForm';
import { Phone, Mail, ArrowUpRight, ListCheck, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface MemberDetailProps {
  member: User;
  onClose: () => void;
}

export const MemberDetail: React.FC<MemberDetailProps> = ({ member, onClose }) => {
  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <ScrollArea className="h-[80vh] pr-4">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={member.profilePicture} alt={member.firstName} />
            <AvatarFallback className="bg-maroon text-white text-xl">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <ArrowUpRight className="mr-2 h-4 w-4 text-green-600" />
                Make Referral
              </Button>
            </DialogTrigger>
            <ReferralForm onComplete={onClose} />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <ListCheck className="mr-2 h-4 w-4 text-orange-600" />
                Record One-to-One
              </Button>
            </DialogTrigger>
            <OneToOneForm onComplete={onClose} />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4 text-purple-600" />
                Record Closed Business
              </Button>
            </DialogTrigger>
            <TYFCBForm onComplete={onClose} />
          </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
};
