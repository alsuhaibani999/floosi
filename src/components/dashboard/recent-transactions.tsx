import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';

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

export const RecentTransactions: React.FC = () => {
  const { data, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
    queryFn: async () => {
      // In a real app, we would fetch this data from the API
      // For demonstration, we'll return sample data
      return [
        {
          id: 1,
          title: 'سوبرماركت الرياض',
          date: '2023-06-15',
          amount: 450 * 100,
          isExpense: true,
          category: {
            name: 'مصاريف المنزل',
            icon: 'ri-shopping-bag-3-line',
            color: '#4CAF50'
          }
        },
        {
          id: 2,
          title: 'تحويل من الراجحي',
          date: '2023-06-14',
          amount: 2000 * 100,
          isExpense: false,
          category: {
            name: 'راتب',
            icon: 'ri-bank-line',
            color: '#4CAF50'
          }
        },
        {
          id: 3,
          title: 'مطعم النخيل',
          date: '2023-06-13',
          amount: 220 * 100,
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
          date: '2023-06-12',
          amount: 150 * 100,
          isExpense: true,
          category: {
            name: 'سيارة ووقود',
            icon: 'ri-gas-station-line',
            color: '#F44336'
          }
        }
      ];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="p-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>آخر المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            <p>خطأ في تحميل المعاملات. يرجى المحاولة مرة أخرى.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm">
      <div className="p-5 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">آخر المعاملات</h3>
          <Link href="/transactions" className="text-primary text-sm">
            عرض الكل
          </Link>
        </div>
      </div>
      
      <div className="p-1">
        {data.map((transaction) => (
          <div 
            key={transaction.id} 
            className="p-4 border-b hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center">
              <div 
                className={`p-3 rounded-full mr-3 text-${transaction.isExpense ? transaction.category.color.replace('#', '') : 'success'}`}
                style={{ 
                  backgroundColor: `${transaction.isExpense ? transaction.category.color : '#4CAF50'}20`
                }}
              >
                <i className={transaction.isExpense ? transaction.category.icon : 'ri-bank-line'}></i>
              </div>
              <div>
                <h4 className="font-medium">{transaction.title}</h4>
                <p className="text-sm text-gray-500">{formatDate(new Date(transaction.date))}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${transaction.isExpense ? 'text-danger' : 'text-success'}`}>
                {transaction.isExpense ? '- ' : '+ '}{formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-gray-500">{transaction.category.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
