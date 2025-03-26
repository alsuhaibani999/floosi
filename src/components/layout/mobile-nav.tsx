import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

export const MobileNav: React.FC = () => {
  const [location] = useLocation();
  
  const menuItems = [
    { path: '/', icon: 'ri-dashboard-line', label: 'الرئيسية' },
    { path: '/transactions', icon: 'ri-exchange-funds-line', label: 'المعاملات' },
    { path: '/budget', icon: 'ri-pie-chart-line', label: 'التقارير' },
    { path: '/settings', icon: 'ri-settings-4-line', label: 'الإعدادات' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 right-0 left-0 bg-white shadow-lg border-t flex z-10">
      {menuItems.map((item, index) => (
        <Link 
          key={item.path} 
          href={item.path}
          className={cn(
            "flex-1 py-2 px-1 flex flex-col items-center",
            location === item.path ? "text-primary" : "text-gray-500"
          )}
        >
          <i className={`${item.icon} text-xl`}></i>
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
      
      {/* Add Transaction Button - Center */}
      <Link 
        href="/transactions/new"
        className="flex-1 py-2 px-1 flex flex-col items-center text-gray-500"
      >
        <i className="ri-add-circle-line text-2xl text-primary"></i>
        <span className="text-xs mt-1">إضافة</span>
      </Link>
    </nav>
  );
};
