import { useState, useCallback, useEffect, useRef } from 'react';
import { Visitor } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchVisitors = useCallback(async (): Promise<void> => {
    // Prevent fetching if already loading
    if (isLoading) return;
    
    // Implement a simple cooldown to prevent rapid refetching
    const now = Date.now();
    const cooldownPeriod = 5000; // 5 seconds cooldown
    if (now - lastFetchTimeRef.current < cooldownPeriod) {
      console.log('Visitors fetch cooldown active, skipping request');
      return;
    }
    
    // Track fetch attempts and implement exponential backoff
    fetchAttemptRef.current += 1;
    const maxRetries = 3;
    if (fetchAttemptRef.current > maxRetries) {
      // Only show error toast on the first time we hit max retries
      if (fetchAttemptRef.current === maxRetries + 1) {
        setLoadError('Too many failed attempts to load visitors. Please try again later.');
        toast.error('Visitors could not be loaded', { 
          description: 'Check your network connection and try again later.',
          id: 'visitors-load-error' // This prevents duplicate toasts
        });
      }
      console.warn(`Visitors fetch exceeded ${maxRetries} attempts, stopping`);
      return;
    }

    // Only show loading state on first attempt 
    if (fetchAttemptRef.current === 1) {
      setIsLoading(true);
    }
    
    lastFetchTimeRef.current = now;

    try {
      console.log('Fetching visitors from Supabase...');
      const { data, error } = await supabase
        .from('visitors')
        .select('*');

      // Always check if the component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (error) {
        console.error('Error fetching visitors:', error);
        setLoadError(error.message);
        // Only show toast on first error, not on every retry
        if (fetchAttemptRef.current === 1) {
          toast.error('Failed to load visitors', {
            id: 'visitors-load-error'
          });
        }
        return;
      }

      console.log(`Retrieved ${data?.length || 0} visitors from Supabase`);
      
      const formattedVisitors: Visitor[] = data ? data.map(visitor => ({
        id: visitor.id,
        visitorName: visitor.visitor_name,
        visitorBusiness: visitor.visitor_business,
        visitDate: new Date(visitor.visit_date),
        hostMemberId: visitor.host_member_id,
        isSelfEntered: visitor.is_self_entered || false,
        phoneNumber: visitor.phone_number,
        email: visitor.email,
        industry: visitor.industry,
        createdAt: new Date(visitor.created_at),
        didNotShow: visitor.did_not_show || false,
      })) : [];

      console.log('Visitors transformed to client format:', formattedVisitors.length);
      setVisitors(formattedVisitors);
      
      // Reset error state and fetch attempts on success
      setLoadError(null);
      fetchAttemptRef.current = 0;
    } catch (error) {
      console.error('Error in fetchVisitors:', error);
      setLoadError(error instanceof Error ? error.message : 'Unknown error');
      
      // Only show toast on first error
      if (fetchAttemptRef.current === 1) {
        toast.error('Failed to load visitors', {
          id: 'visitors-load-error' 
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  // Add auto-fetching on mount
  useEffect(() => {
    console.log('Visitors hook mounted, fetching visitors...');
    fetchVisitors();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchVisitors]);

  const resetFetchState = useCallback(() => {
    fetchAttemptRef.current = 0;
    setLoadError(null);
    lastFetchTimeRef.current = 0;
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
    markVisitorNoShow,
    fetchVisitors,
    isLoading,
    loadError,
    resetFetchState,
    cleanup
  };
};
