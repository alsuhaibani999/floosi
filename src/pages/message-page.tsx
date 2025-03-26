import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { MessageParser } from '@/components/dashboard/message-parser';

const MessagePage: React.FC = () => {
  return (
    <AppShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">تحليل الرسائل البنكية</h2>
        <p className="text-gray-500">استخراج المعاملات المالية من الرسائل البنكية تلقائياً</p>
      </div>
      
      <MessageParser />
      
      <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold mb-4">رسائل مدعومة</h3>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">مصرف الراجحي</h4>
            <p className="text-sm text-gray-600">مثال: تم خصم مبلغ 150 ريال من حسابك لدى مصرف الراجحي بتاريخ 12/06/2023 رقم العملية #1234</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">البنك الأهلي</h4>
            <p className="text-sm text-gray-600">مثال: تم إيداع مبلغ 2000 ريال في حسابك لدى البنك الأهلي السعودي بتاريخ 14/06/2023</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">بنك الرياض</h4>
            <p className="text-sm text-gray-600">مثال: تم سحب مبلغ 350 ريال من حسابك لدى بنك الرياض بتاريخ 10/06/2023</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default MessagePage;
