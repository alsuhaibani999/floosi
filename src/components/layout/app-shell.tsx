import React, { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { useAuth } from '@/hooks/use-auth';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        user={user}
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)} 
      />
      
      <main className="flex-grow">
        <div className="md:flex">
          <Sidebar 
            showMobile={showMobileMenu} 
            onClose={() => setShowMobileMenu(false)} 
          />
          
          <div className="flex-grow p-4">
            {children}
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
};
