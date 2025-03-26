import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Category } from '@shared/schema';

interface ParsedMessage {
  amount: number;
  type: 'deposit' | 'withdrawal';
  isExpense: boolean;
  date: string;
  bankName: string | null;
}

interface MessageParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedMessage;
}

export const MessageParserModal: React.FC<MessageParserModalProps> = ({
  isOpen,
  onClose,
  parsedData
}) => {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState<string>('');
  
  // Get accounts for dropdown
  const { data: accounts } = useQuery({
    queryKey: ['/api/accounts'],
    queryFn: async () => {
      // In a real app, we would fetch accounts from the API
      return [
        { id: 1, name: 'الحساب الرئيسي' }
      ];
    },
  });
  
  // Get categories for dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      // In a real app, we would fetch categories from the API
      // For demonstration, we'll return sample categories
      return [
        { id: 1, name: 'راتب', isExpense: false, userId: 1, icon: 'ri-money-dollar-circle-line', color: '#4CAF50' },
        { id: 2, name: 'تحويل', isExpense: false, userId: 1, icon: 'ri-exchange-funds-line', color: '#2196F3' },
        { id: 3, name: 'مكافأة', isExpense: false, userId: 1, icon: 'ri-award-line', color: '#FF9800' },
        { id: 4, name: 'أخرى', isExpense: false, userId: 1, icon: 'ri-more-line', color: '#9E9E9E' }
      ].filter(cat => cat.isExpense === parsedData.isExpense);
    },
  });
  
  // Save transaction mutation
  const saveTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/transactions', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      onClose();
    },
  });
  
  const handleSaveTransaction = () => {
    if (!accounts?.[0]?.id) return;
    
    saveTransactionMutation.mutate({
      accountId: accounts[0].id,
      categoryId: parseInt(categoryId),
      amount: parsedData.amount * 100, // Convert to lowest denomination
      date: parsedData.date,
      isExpense: parsedData.isExpense,
      note: `تم استخراج المعاملة من رسالة بنكية ${parsedData.bankName ? `من ${parsedData.bankName}` : ''}`,
    });
  };

  if (!categories || !accounts) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>نتيجة تحليل الرسالة</DialogTitle>
        </DialogHeader>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-500">نوع المعاملة</p>
              <p className="font-medium">
                {parsedData.isExpense ? 'مصروف' : 'إيداع'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">المبلغ</p>
              <p className={`font-medium ${parsedData.isExpense ? 'text-danger' : 'text-success'}`}>
                {parsedData.isExpense ? '- ' : '+ '}{formatCurrency(parsedData.amount * 100)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">التاريخ</p>
              <p className="font-medium">{formatDate(new Date(parsedData.date))}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">البنك</p>
              <p className="font-medium">{parsedData.bankName || 'غير محدد'}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">تصنيف المعاملة</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <i className={category.icon}></i>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={handleSaveTransaction}
            disabled={!categoryId || saveTransactionMutation.isPending}
          >
            {saveTransactionMutation.isPending ? (
              <span className="flex items-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                جاري الحفظ...
              </span>
            ) : (
              "حفظ المعاملة"
            )}
          </Button>
          <Button 
            className="flex-1" 
            variant="outline" 
            onClick={onClose}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
