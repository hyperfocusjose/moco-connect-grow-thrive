import { useState, useCallback, useEffect, useRef } from 'react';
import { Visitor } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchVisitors = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadError(null);
    console.log('fetchVisitors: Starting to fetch visitors');

    try {
      const { data, error } = await supabase.from('visitors').select('*');
      if (!isMountedRef.current) return;

      if (error) {
        console.error('Error fetching visitors:', error);
        setLoadError(error.message);
        toast.error('Failed to load visitors', { id: 'visitors-load-error' });
        return;
      }

      console.log('fetchVisitors: Fetched visitors:', data?.length || 0);

      const formatted: Visitor[] = (data || []).map(v => ({
        id: v.id,
        visitorName: v.visitor_name,
        visitorBusiness: v.visitor_business,
        visitDate: new Date(v.visit_date),
        hostMemberId: v.host_member_id,
        isSelfEntered: v.is_self_entered || false,
        phoneNumber: v.phone_number,
        email: v.email,
        industry: v.industry,
        createdAt: new Date(v.created_at),
        didNotShow: v.did_not_show || false,
      }));

      setVisitors(formatted);
      setLoadError(null);
    } catch (error) {
      console.error('Error in fetchVisitors:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load visitors', { id: 'visitors-load-error' });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      console.log('fetchVisitors: Completed');
    }
  }, [isLoading]);

  useEffect(() => {
    console.log('useVisitors: Initial mount, fetching visitors');
    fetchVisitors();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchVisitors]);

  const resetFetchState = useCallback(() => {
    setLoadError(null);
  }, []);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

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

      if (error) throw error;

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

      if (error) throw error;

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

      if (error) throw error;

      setVisitors(prev =>
        prev.map(v => v.id === id ? { ...v, didNotShow: true } : v)
      );
      toast.success('Visitor marked as no-show');
    } catch (error) {
      console.error('Error in markVisitorNoShow:', error);
      toast.error('Failed to mark visitor as no-show');
    }
  };

  return {
    visitors,
    isLoading,
    loadError,
    addVisitor,
    updateVisitor,
    markVisitorNoShow,
    fetchVisitors,
    resetFetchState,
    cleanup
  };
};
