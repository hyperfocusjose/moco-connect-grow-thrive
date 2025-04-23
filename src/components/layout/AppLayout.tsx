
import React from 'react';
import { Navbar } from './Navbar';
import { MobileNavbar } from './MobileNavbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Outlet, Navigate } from 'react-router-dom';

interface AppLayoutProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  requireAuth = false,
  requireAdmin = false,
}) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const isMobile = useIsMobile();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
      </div>
    );
  }

  // Handle authentication requirements
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle admin requirements
  if (requireAdmin && (!isAuthenticated || !currentUser?.isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header>
        <Navbar />
        {isMobile && <div className="fixed top-3 left-3 z-50"><MobileNavbar /></div>}
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Montgomery County Professional Networking Group
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-maroon">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-maroon">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-maroon">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
