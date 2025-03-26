import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  showMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  showMobile = false,
  onClose 
}) => {
  const [location] = useLocation();
  
  const menuItems = [
    { path: '/', icon: 'ri-dashboard-line', label: 'لوحة التحكم' },
    { path: '/transactions', icon: 'ri-exchange-funds-line', label: 'المعاملات' },
    { path: '/accounts', icon: 'ri-bank-card-line', label: 'الحسابات' },
    { path: '/budget', icon: 'ri-pie-chart-line', label: 'الميزانية' },
    { path: '/investment', icon: 'ri-line-chart-line', label: 'الاستثمار' },
    { path: '/messages', icon: 'ri-message-2-line', label: 'تحليل الرسائل' },
    { path: '/gemini-analysis', icon: 'ri-ai-generate', label: 'تحليل ذكي' },
    { path: '/gemini-pydantic', icon: 'ri-bar-chart-box-line', label: 'التحليل المنتظم' },
    { path: '/api-tester', icon: 'ri-bug-line', label: 'اختبار الواجهات' },
    { path: '/settings', icon: 'ri-settings-4-line', label: 'الإعدادات' },
  ];

  const sidebarClasses = cn(
    "bg-white shadow-sm h-[calc(100vh-3.5rem)] sticky top-14 overflow-auto",
    "md:block md:w-64",
    showMobile ? "fixed inset-0 z-50 w-64" : "hidden"
  );

  return (
    <>
      {/* Overlay for mobile */}
      {showMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={sidebarClasses}>
        {showMobile && (
          <div className="flex justify-end p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="md:hidden"
            >
              <i className="ri-close-line text-xl"></i>
            </Button>
          </div>
        )}
        
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    location === item.path
                      ? "bg-primary bg-opacity-10 text-primary"
                      : "hover:bg-gray-100 text-gray-600"
                  )}
                  onClick={onClose}
                >
                  <i className={`${item.icon} text-lg`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
