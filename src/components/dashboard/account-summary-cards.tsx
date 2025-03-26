import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface AccountSummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
}

export const AccountSummaryCards: React.FC = () => {
  const { data, isLoading, error } = useQuery<AccountSummaryData>({
    queryKey: ['/api/dashboard/summary'],
    queryFn: async () => {
      // In a real app, we would fetch this data from the API
      // For demonstration, we'll return sample data
      return {
        totalBalance: 12350 * 100, // Converting to lowest denomination (halalas)
        monthlyIncome: 8000 * 100,
        monthlyExpenses: 5650 * 100,
        balanceChange: 5.2,
        incomeChange: 1.8,
        expenseChange: 7.5
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-5">
              <Skeleton className="h-6 w-28 mb-2" />
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
        <p>خطأ في تحميل بيانات الحساب. يرجى المحاولة مرة أخرى.</p>
      </div>
    );
  }

  const { totalBalance, monthlyIncome, monthlyExpenses, balanceChange, incomeChange, expenseChange } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Balance Card */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-gray-500 text-sm">الرصيد الكلي</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary">
            <i className="ri-wallet-3-line"></i>
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className={`flex items-center ${balanceChange >= 0 ? 'text-success' : 'text-danger'}`}>
            <i className={`${balanceChange >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
            {Math.abs(balanceChange)}٪
          </span>
          <span className="text-gray-500 mx-1">مقارنة بالشهر الماضي</span>
        </div>
      </div>
      
      {/* Income Card */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-gray-500 text-sm">الدخل الشهري</h3>
            <p className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</p>
          </div>
          <div className="p-2 rounded-full bg-success bg-opacity-10 text-success">
            <i className="ri-arrow-down-circle-line"></i>
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className={`flex items-center ${incomeChange >= 0 ? 'text-success' : 'text-danger'}`}>
            <i className={`${incomeChange >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
            {Math.abs(incomeChange)}٪
          </span>
          <span className="text-gray-500 mx-1">مقارنة بالشهر الماضي</span>
        </div>
      </div>
      
      {/* Expenses Card */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-gray-500 text-sm">المصروفات الشهرية</h3>
            <p className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</p>
          </div>
          <div className="p-2 rounded-full bg-danger bg-opacity-10 text-danger">
            <i className="ri-arrow-up-circle-line"></i>
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className={`flex items-center ${expenseChange <= 0 ? 'text-success' : 'text-danger'}`}>
            <i className={`${expenseChange <= 0 ? 'ri-arrow-down-line' : 'ri-arrow-up-line'} mr-1`}></i>
            {Math.abs(expenseChange)}٪
          </span>
          <span className="text-gray-500 mx-1">مقارنة بالشهر الماضي</span>
        </div>
      </div>
    </div>
  );
};
