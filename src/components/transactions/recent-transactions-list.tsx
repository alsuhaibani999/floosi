import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// نوع البيانات للمعاملة
interface Transaction {
  id: number;
  title: string;
  date: string;
  amount: number;
  isExpense: boolean;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

export const RecentTransactionsList: React.FC = () => {
  const { toast } = useToast();
  
  // استرجاع البيانات من الخادم
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
    queryFn: async () => {
      // في الوقت الحالي نستخدم بيانات مؤقتة للعرض
      // سيتم استبدال هذا بطلب حقيقي للخادم عندما يتم تنفيذ واجهة برمجة التطبيقات
      await new Promise(resolve => setTimeout(resolve, 800)); // محاكاة تأخير الشبكة
      
      const mockData: Transaction[] = [
        {
          id: 1,
          title: 'سوبرماركت الرياض',
          date: 'ذو القعدة ١٤٤٦',
          amount: 450,
          isExpense: true,
          category: {
            name: 'مصاريف المنزل',
            icon: 'ri-home-line',
            color: '#4CAF50'
          }
        },
        {
          id: 2,
          title: 'تحويل من الراجحي',
          date: 'ذو القعدة ٢٥',
          amount: 2000,
          isExpense: false,
          category: {
            name: 'راتب',
            icon: 'ri-bank-line',
            color: '#2196F3'
          }
        },
        {
          id: 3,
          title: 'مطعم النخيل',
          date: 'ذو القعدة ٢٤',
          amount: 320,
          isExpense: true,
          category: {
            name: 'مطاعم',
            icon: 'ri-restaurant-line',
            color: '#FF9800'
          }
        },
        {
          id: 4,
          title: 'محطة وقود الشمال',
          date: 'ذو القعدة ٢٣',
          amount: 150,
          isExpense: true,
          category: {
            name: 'سيارة ووقود',
            icon: 'ri-gas-station-line',
            color: '#E91E63'
          }
        }
      ];
      
      return mockData;
    }
  });
  
  return (
    <Card className="mt-8">
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <CardTitle className="text-xl">آخر المعاملات</CardTitle>
        <Button variant="link" className="text-primary">عرض الكل</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="divide-y">
            {transactions?.map((transaction) => (
              <div 
                key={transaction.id} 
                className="py-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${transaction.category.color}20` }}
                  >
                    <i 
                      className={`${transaction.category.icon} text-xl`}
                      style={{ color: transaction.category.color }}
                    ></i>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{transaction.title}</h4>
                    <div className="text-sm text-gray-500 flex items-center">
                      <i className="ri-calendar-line ml-1 text-xs"></i>
                      <span>{transaction.date}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {transaction.category.name}
                    </div>
                  </div>
                </div>
                
                <div className={`text-left font-medium ${transaction.isExpense ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.isExpense ? '- ' : '+ '}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};