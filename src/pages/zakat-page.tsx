import React from 'react';
import { AppShell } from '@/components/layout/app-shell';

const ZakatPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">حاسبة الزكاة</h2>
        <p className="text-gray-500">حساب الزكاة المستحقة على أموالك</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-center text-gray-500">سيتم إضافة حاسبة الزكاة هنا قريباً.</p>
      </div>
    </AppShell>
  );
};

export default ZakatPage;
