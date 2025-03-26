import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface MonthlySpending {
  month: string;
  arabicMonth: string;
  amount: number;
  percentage: number;
}

interface SpendingChartData {
  timeframes: { value: string; label: string }[];
  data: MonthlySpending[];
}

export const SpendingChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState('week');
  
  const { data, isLoading, error } = useQuery<SpendingChartData>({
    queryKey: ['/api/dashboard/spending', timeframe],
    queryFn: async () => {
      // In a real app, we would fetch this data from the API based on the timeframe
      // For demonstration, we'll return sample data
      return {
        timeframes: [
          { value: 'week', label: 'هذا الأسبوع' },
          { value: '30days', label: 'آخر ٣٠ يوم' },
          { value: 'month', label: 'هذا الشهر' },
          { value: '3months', label: 'آخر ٣ أشهر' },
        ],
        data: [
          { month: 'Jan', arabicMonth: 'يناير', amount: 4200, percentage: 70 },
          { month: 'Feb', arabicMonth: 'فبراير', amount: 2400, percentage: 40 },
          { month: 'Mar', arabicMonth: 'مارس', amount: 5100, percentage: 85 },
          { month: 'Apr', arabicMonth: 'أبريل', amount: 3300, percentage: 55 },
          { month: 'May', arabicMonth: 'مايو', amount: 3900, percentage: 65 },
          { month: 'Jun', arabicMonth: 'يونيو', amount: 3600, percentage: 60 },
        ]
      };
    },
  });

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تحليل المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            <p>خطأ في تحميل بيانات المصروفات. يرجى المحاولة مرة أخرى.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">تحليل المصروفات</h3>
        <Select value={timeframe} onValueChange={handleTimeframeChange}>
          <SelectTrigger className="text-sm border border-gray-200 rounded-lg p-1 focus:outline-none focus:ring-1 focus:ring-primary w-36">
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent>
            {data.timeframes.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Spending Chart */}
      <div className="h-64 flex items-end justify-between">
        {data.data.map((item, index) => (
          <div key={item.month} className="relative flex flex-col items-center flex-1 h-full">
            <div className="absolute bottom-0 flex flex-col items-center" style={{"--target-height": `${item.percentage}%`} as any}>
              <div 
                className={`chart-bar w-6 rounded-t-md mb-1 ${index === data.data.length - 1 ? 'bg-primary-light' : 'bg-primary'}`} 
                style={{"--target-height": `${item.percentage}%`, height: `${item.percentage}%`} as any}
                title={formatCurrency(item.amount * 100)}
              ></div>
              <span className="text-xs text-gray-500 mt-1">{item.arabicMonth}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
