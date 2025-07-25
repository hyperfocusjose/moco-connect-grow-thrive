import { useState, useCallback, useEffect } from 'react';
import { Visitor } from '@/types';
import { demoVisitors } from '@/data/demoData';
import { toast } from 'sonner';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setVisitors(demoVisitors);
      console.log(`Successfully loaded ${demoVisitors.length} demo visitors`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLoadError(errorMsg);
      console.error('Error fetching visitors:', error);
      toast.error('Failed to load visitors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const addVisitor = async (visitorData: Partial<Visitor>) => {
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      visitorName: visitorData.visitorName || '',
      visitorBusiness: visitorData.visitorBusiness || '',
      visitDate: visitorData.visitDate || new Date(),
      hostMemberId: visitorData.hostMemberId,
      hostMemberName: visitorData.hostMemberName,
      phoneNumber: visitorData.phoneNumber || '',
      email: visitorData.email || '',
      industry: visitorData.industry || '',
      createdAt: new Date(),
      didNotShow: false,
      ...visitorData,
    };
    
    setVisitors(prev => [...prev, newVisitor]);
    toast.success('Visitor added successfully');
    return newVisitor;
  };

  const updateVisitor = async (id: string, visitorData: Partial<Visitor>) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === id ? { ...visitor, ...visitorData } : visitor
    ));
    toast.success('Visitor updated successfully');
    return Promise.resolve();
  };

  const markVisitorNoShow = async (id: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === id ? { ...visitor, didNotShow: true } : visitor
    ));
    toast.success('Visitor marked as no-show');
    return Promise.resolve();
  };

  return {
    visitors,
    isLoading,
    loadError,
    addVisitor,
    updateVisitor,
    markVisitorNoShow,
    fetchVisitors,
    resetFetchState: () => setLoadError(null)
  };
};