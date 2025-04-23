import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ListCheck,
  Bell,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const MobileNavbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="py-6">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <span className="font-bold text-xl text-maroon tracking-tighter">MocoPNG</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          {isAuthenticated ? (
            <>
              <div className="flex items-center mb-6 space-x-3 px-2">
                <Avatar>
                  <AvatarImage src={currentUser?.profilePicture} alt={currentUser?.firstName} />
                  <AvatarFallback className="bg-maroon text-white">
                    {currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.businessName}
                  </p>
                </div>
              </div>

              <nav className="space-y-1 flex-1">
                <Link
                  to="/dashboard"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="mr-3 h-5 w-5 text-maroon" />
                  Dashboard
                </Link>
                <Link
                  to="/directory"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  <Users className="mr-3 h-5 w-5 text-maroon" />
                  Directory
                </Link>
                <Link
                  to="/events"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  <Calendar className="mr-3 h-5 w-5 text-maroon" />
                  Events
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  <ListCheck className="mr-3 h-5 w-5 text-maroon" />
                  Reports
                </Link>
                <Link
                  to="/polls"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  <Bell className="mr-3 h-5 w-5 text-maroon" />
                  Polls
                </Link>
              </nav>

              <div className="border-t border-gray-200 mt-6 pt-4">
                <Link
                  to="/profile"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  Profile Settings
                </Link>
                {currentUser?.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                    onClick={() => setOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-3 text-sm font-medium hover:bg-secondary text-destructive"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-6">
              <Button asChild variant="outline">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
