import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Banknote, Building, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccountsPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">الحسابات</h2>
          <p className="text-gray-500">إدارة حساباتك البنكية ومتابعة أرصدتها</p>
        </div>
        <Button size="sm" className="flex items-center gap-1">
          <Plus size={16} /> إضافة حساب
        </Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Building size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">لا توجد حسابات مرتبطة</h3>
          <p className="text-gray-500 mb-4">قم بإضافة حساباتك البنكية لمتابعة جميع معاملاتك المالية في مكان واحد</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 pt-2 pr-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            قريباً
          </Badge>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="bg-white/80 p-3 rounded-full">
            <Banknote size={24} className="text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">الربط المباشر مع البنوك</h3>
            <p className="text-gray-700">قريباً سيتم إضافة خاصية الربط المباشر مع البنوك السعودية لتحديث معاملاتك تلقائياً</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AccountsPage;
