import React from 'react';
import { AppShell } from '@/components/layout/app-shell';

const BudgetPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">الميزانية</h2>
        <p className="text-gray-500">إنشاء وإدارة ميزانيتك الشهرية</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-center text-gray-500">سيتم عرض ميزانيتك هنا مع مزيد من الميزات قريباً.</p>
      </div>
    </AppShell>
  );
};

export default BudgetPage;
