import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ListCheck,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

export const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <nav className="bg-maroon text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tighter">MocoPNG</span>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && !isMobile && (
            <div className="flex items-center space-x-1 md:space-x-4">
              <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-maroon-light transition-colors flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link to="/directory" className="px-3 py-2 rounded-md hover:bg-maroon-light transition-colors flex items-center gap-1">
                <Users className="h-4 w-4" />
                Directory
              </Link>
              <Link to="/events" className="px-3 py-2 rounded-md hover:bg-maroon-light transition-colors flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Events
              </Link>
              <Link to="/reports" className="px-3 py-2 rounded-md hover:bg-maroon-light transition-colors flex items-center gap-1">
                <ListCheck className="h-4 w-4" />
                Reports
              </Link>
              <Link to="/polls" className="px-3 py-2 rounded-md hover:bg-maroon-light transition-colors flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Polls
              </Link>
            </div>
          )}

          {/* Authentication Section */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={currentUser?.profilePicture} alt={currentUser?.firstName} />
                      <AvatarFallback className="bg-maroon-light text-white">
                        {currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {currentUser?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-white">
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
