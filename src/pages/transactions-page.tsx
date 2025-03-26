import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { TransactionFormModal } from '@/components/modals/transaction-form-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/transactions/file-uploader';
import { SaudiBankUploader } from '@/components/transactions/saudi-bank-uploader';
import { RecentTransactionsList } from '@/components/transactions/recent-transactions-list';
import { MessageSquare, BarChart3 } from 'lucide-react';

const TransactionsPage: React.FC = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  return (
    <AppShell>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">المعاملات</h2>
          <p className="text-gray-500">عرض وإدارة جميع معاملاتك المالية</p>
        </div>
        
        <Button 
          className="bg-primary text-white"
          onClick={() => setShowTransactionModal(true)}
        >
          <i className="ri-add-line ml-1"></i>
          إضافة معاملة
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="bg-muted/50 p-1 mb-4">
          <TabsTrigger value="all" className="flex-1">جميع المعاملات</TabsTrigger>
          <TabsTrigger value="import" className="flex-1">استيراد الرسائل النصية</TabsTrigger>
          <TabsTrigger value="saudi-banks" className="flex-1">البنوك السعودية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-center text-gray-500">سيتم عرض جميع المعاملات هنا مع مزيد من الميزات قريباً.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="import" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الرسائل النصية</CardTitle>
              <CardDescription>قم بإدخال رسائل البنك النصية لتحليلها واستيراد المعاملات تلقائياً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank">اختر البنك</Label>
                <select 
                  id="bank" 
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="alrajhi">مصرف الراجحي</option>
                  <option value="alinma">مصرف الإنماء</option>
                  <option value="alahli">البنك الأهلي السعودي</option>
                  <option value="albilad">بنك البلاد</option>
                  <option value="riyadh">بنك الرياض</option>
                </select>
              </div>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/50 rounded-lg p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="mb-4">
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-3">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">تحليل رسائل البنك النصية</h3>
                  <p className="text-muted-foreground mb-4">الصق الرسائل النصية من البنك هنا لتحليلها واستخراج المعاملات</p>
                  
                  <Textarea 
                    placeholder="مثال: تم خصم مبلغ 500 ريال من حسابك بتاريخ 25/03/2025 - مشتريات التطبيقات" 
                    className="min-h-[150px] mb-4 text-right" 
                  />
                  
                  <Button size="lg" className="min-w-[180px]">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    تحليل الرسالة
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border border-dashed border-primary/50 p-4 bg-primary/5 mt-6">
                <h3 className="text-sm font-medium mb-2">ملاحظات هامة:</h3>
                <ul className="text-sm space-y-1 text-gray-600 mr-5 list-disc">
                  <li>يتم تحليل نص الرسالة لاستخراج المعلومات المالية منها</li>
                  <li>يتم التعرف على التاريخ والمبلغ ونوع المعاملة تلقائياً</li>
                  <li>يمكنك مراجعة وتعديل المعاملات قبل إضافتها</li>
                  <li>الميزة تعمل مع معظم البنوك السعودية</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saudi-banks" className="mt-0">
          <SaudiBankUploader />
        </TabsContent>
      </Tabs>
      
      {/* تم إزالة قسم آخر المعاملات بناءً على طلب المستخدم */}
      
      {/* Transaction Form Modal */}
      <TransactionFormModal 
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </AppShell>
  );
};

export default TransactionsPage;