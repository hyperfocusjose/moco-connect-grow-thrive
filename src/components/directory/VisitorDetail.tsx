
import React from 'react';
import { DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import type { Visitor } from '@/types';
import { Badge } from '@/components/ui/badge';

interface VisitorDetailProps {
  visitor: Visitor;
  onClose: () => void;
}

export const VisitorDetail: React.FC<VisitorDetailProps> = ({ visitor, onClose }) => {
  return (
    <div className="p-6">
      <DialogHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-bold">{visitor.visitorName}</h2>
          <p className="text-muted-foreground">{visitor.visitorBusiness}</p>
          {visitor.didNotShow && (
            <Badge variant="destructive">No Show</Badge>
          )}
        </div>
      </DialogHeader>

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="font-medium mb-2">Visit Information</h3>
          <div className="text-sm space-y-2">
            <p>Date: {format(new Date(visitor.visitDate), 'MMMM dd, yyyy')}</p>
            {visitor.hostMemberId && (
              <p>Invited by: {visitor.hostMemberName || 'Unknown Member'}</p>
            )}
            {visitor.industry && <p>Industry: {visitor.industry}</p>}
          </div>
        </div>

        {(visitor.phoneNumber || visitor.email) && (
          <div>
            <h3 className="font-medium mb-2">Contact Information</h3>
            <div className="space-y-2">
              {visitor.phoneNumber && (
                <a
                  href={`tel:${visitor.phoneNumber}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {visitor.phoneNumber}
                </a>
              )}
              {visitor.email && (
                <a
                  href={`mailto:${visitor.email}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {visitor.email}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
