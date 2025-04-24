
import { useState } from 'react';
import { Visitor } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const addVisitor = async (visitor: Partial<Visitor>) => {
    try {
      const newVisitor: Visitor = {
        id: uuidv4(),
        visitorName: visitor.visitorName || '',
        visitorBusiness: visitor.visitorBusiness || '',
        visitDate: visitor.visitDate || new Date(),
        hostMemberId: visitor.hostMemberId,
        isSelfEntered: visitor.isSelfEntered || false,
        phoneNumber: visitor.phoneNumber,
        email: visitor.email,
        industry: visitor.industry,
        createdAt: new Date(),
        didNotShow: false,
      };

      const { error } = await supabase.from('visitors').insert({
        id: newVisitor.id,
        visitor_name: newVisitor.visitorName,
        visitor_business: newVisitor.visitorBusiness,
        visit_date: newVisitor.visitDate.toISOString(),
        host_member_id: newVisitor.hostMemberId,
        is_self_entered: newVisitor.isSelfEntered,
        phone_number: newVisitor.phoneNumber,
        email: newVisitor.email,
        industry: newVisitor.industry,
        created_at: newVisitor.createdAt.toISOString(),
        did_not_show: newVisitor.didNotShow,
      });

      if (error) {
        console.error('Error adding visitor:', error);
        toast.error('Failed to add visitor');
        return;
      }

      setVisitors(prev => [...prev, newVisitor]);
      toast.success('Visitor added successfully');
    } catch (error) {
      console.error('Error in addVisitor:', error);
      toast.error('Failed to add visitor');
    }
  };

  const updateVisitor = async (id: string, visitor: Partial<Visitor>) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({
          visitor_name: visitor.visitorName,
          visitor_business: visitor.visitorBusiness,
          visit_date: visitor.visitDate?.toISOString(),
          host_member_id: visitor.hostMemberId,
          is_self_entered: visitor.isSelfEntered,
          phone_number: visitor.phoneNumber,
          email: visitor.email,
          industry: visitor.industry,
          did_not_show: visitor.didNotShow,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating visitor:', error);
        toast.error('Failed to update visitor');
        return;
      }

      setVisitors(prev => 
        prev.map(item => item.id === id ? { ...item, ...visitor } : item)
      );
      toast.success('Visitor updated successfully');
    } catch (error) {
      console.error('Error in updateVisitor:', error);
      toast.error('Failed to update visitor');
    }
  };

  const markVisitorNoShow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ did_not_show: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking visitor as no-show:', error);
        toast.error('Failed to mark visitor as no-show');
        return;
      }

      setVisitors(prev =>
        prev.map(visitor =>
          visitor.id === id ? { ...visitor, didNotShow: true } : visitor
        )
      );
      
      toast.success('Visitor marked as no-show');
    } catch (error) {
      console.error('Error in markVisitorNoShow:', error);
      toast.error('Failed to mark visitor as no-show');
    }
  };

  return {
    visitors,
    addVisitor,
    updateVisitor,
    markVisitorNoShow
  };
};
