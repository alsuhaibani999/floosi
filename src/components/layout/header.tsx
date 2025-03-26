import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@shared/schema';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  user: User;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMenuToggle }) => {
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get first letter of the user's full name or username
  const userInitial = user.fullName 
    ? user.fullName.charAt(0) 
    : user.username.charAt(0);
  
  // Display name (full name or username)
  const displayName = user.fullName || user.username;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and App Title */}
        <div className="flex items-center gap-2">
          <button className="md:hidden mr-2" onClick={onMenuToggle}>
            <i className="ri-menu-line text-xl"></i>
          </button>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                <i className="ri-money-dirham-circle-line text-xl"></i>
              </div>
              <h1 className="text-xl font-bold text-primary hidden sm:block">فلوسي</h1>
            </div>
          </Link>
        </div>
        
        {/* Search Input - Desktop */}
        <div className="hidden md:block relative flex-grow max-w-md mx-4">
          <input 
            type="text" 
            placeholder="بحث..." 
            className="w-full pr-10 py-2 px-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
        </div>
        
        {/* User Menu */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <i className="ri-notification-3-line text-gray-500"></i>
            <span className="absolute top-1 left-1 h-2 w-2 bg-destructive rounded-full"></span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 flex items-center gap-2 cursor-pointer hover:bg-transparent">
                <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center font-medium">
                  {userInitial}
                </div>
                <span className="hidden sm:block text-sm">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="flex items-center gap-2">
                    <i className="ri-user-settings-line"></i>
                    <span>الإعدادات</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <div className="flex items-center gap-2">
                  <i className="ri-logout-box-line"></i>
                  <span>تسجيل الخروج</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
