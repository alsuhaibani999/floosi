import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export const CategoryBreakdown: React.FC = () => {
  const { data, isLoading, error } = useQuery<CategoryData[]>({
    queryKey: ['/api/dashboard/categories'],
    queryFn: async () => {
      // In a real app, we would fetch this data from the API
      // For demonstration, we'll return sample data
      return [
        { name: 'مصاريف المنزل', amount: 2100 * 100, percentage: 35, color: '#4CAF50' },
        { name: 'السيارة والوقود', amount: 1500 * 100, percentage: 25, color: '#2196F3' },
        { name: 'المطاعم', amount: 1200 * 100, percentage: 20, color: '#FF9800' },
        { name: 'التسوق', amount: 850 * 100, percentage: 15, color: '#F44336' },
        { name: 'أخرى', amount: 300 * 100, percentage: 5, color: '#9E9E9E' },
      ];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
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
          <CardTitle>تصنيف المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            <p>خطأ في تحميل بيانات التصنيف. يرجى المحاولة مرة أخرى.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-bold mb-4">تصنيف المصروفات</h3>
      
      <div className="space-y-4">
        {data.map((category) => (
          <div key={category.name}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">{category.name}</span>
              <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
