import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Tip {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export const FinancialTips: React.FC = () => {
  const { data, isLoading, error } = useQuery<Tip>({
    queryKey: ['/api/tips/daily'],
    queryFn: async () => {
      // In a real app, we would fetch this data from the API
      // For demonstration, we'll return a sample tip
      return {
        id: '1',
        title: 'هل تعلم؟',
        content: 'توفير ١٠٪ من دخلك الشهري سيساعدك على تجميع مبلغ للطوارئ يكفي لثلاثة أشهر خلال عام واحد فقط.',
        icon: 'ri-lightbulb-line'
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="mt-6 p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="flex">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-bold mb-4">نصائح مالية</h3>
      
      <div className="bg-primary bg-opacity-5 rounded-lg p-4 border-r-4 border-primary">
        <div className="flex">
          <div className="p-2 rounded-full bg-primary text-white mr-3">
            <i className={data.icon}></i>
          </div>
          <div>
            <h4 className="font-medium text-primary">{data.title}</h4>
            <p className="text-sm text-gray-700 mt-1">
              {data.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
