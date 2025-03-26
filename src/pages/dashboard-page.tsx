import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AccountSummaryCards } from '@/components/dashboard/account-summary-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { MessageParser } from '@/components/dashboard/message-parser';
import { FinancialTips } from '@/components/dashboard/financial-tips';
import { Button } from '@/components/ui/button';
import { TransactionFormModal } from '@/components/modals/transaction-form-modal';
import { WelcomeModal } from '@/components/modals/welcome-modal';
import { useAuth } from '@/hooks/use-auth';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان المستخدم جديدًا باستخدام localStorage
    const hasSeenWelcome = localStorage.getItem(`floosi_welcome_seen_${user?.id}`);

    if (!hasSeenWelcome && user) {
      setShowWelcomeModal(true);
    }
  }, [user]);

  const handleCloseWelcomeModal = () => {
    if (user) {
      // حفظ أن المستخدم قد رأى الشاشة الترحيبية
      localStorage.setItem(`floosi_welcome_seen_${user.id}`, 'true');
    }
    setShowWelcomeModal(false);
  };
  
  return (
    <AppShell>
      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={handleCloseWelcomeModal}
        userName={user?.fullName || user?.username}
      />
      
      {/* Page Title */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">لوحة التحكم</h2>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground" 
                  onClick={() => setShowWelcomeModal(true)}
                >
                  <HelpCircle size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>عرض دليل المساعدة</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-gray-500">مرحباً بك، {user?.fullName || user?.username}! هذا ملخص وضعك المالي.</p>
        </div>
        
        {/* Add Transaction Button (Desktop) */}
        <div className="hidden md:block">
          <Button 
            className="bg-primary text-white"
            onClick={() => setShowTransactionModal(true)}
          >
            <i className="ri-add-line ml-1"></i>
            إضافة معاملة
          </Button>
        </div>
      </div>
      
      {/* Account Summary Cards */}
      <AccountSummaryCards />
      
      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>
        <div>
          <CategoryBreakdown />
        </div>
      </div>
      
      {/* Recent Transactions */}
      <RecentTransactions />
      
      {/* Bank Message Parser */}
      <MessageParser />
      
      {/* Financial Tips */}
      <FinancialTips />
      
      {/* Transaction Form Modal */}
      <TransactionFormModal 
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </AppShell>
  );
};

export default DashboardPage;
