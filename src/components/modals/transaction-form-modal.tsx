import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { InsertTransaction, Category, Account } from '@shared/schema';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    isExpense: boolean;
  };
}

// Form schema
const transactionSchema = z.object({
  amount: z.string().min(1, { message: "المبلغ مطلوب" }).refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "يجب أن يكون المبلغ رقماً موجباً",
  }),
  accountId: z.string().min(1, { message: "الحساب مطلوب" }),
  categoryId: z.string().min(1, { message: "التصنيف مطلوب" }),
  isExpense: z.boolean(),
  date: z.string().min(1, { message: "التاريخ مطلوب" }),
  note: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  initialData = { isExpense: true }
}) => {
  const queryClient = useQueryClient();
  const [isExpense, setIsExpense] = useState(initialData.isExpense);
  
  // Get accounts for dropdown
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    queryFn: async () => {
      // In a real app, we would fetch accounts from the API
      return [
        { id: 1, name: 'الحساب الرئيسي', balance: 0, userId: 1, color: "#039089", isDefault: true, bankName: "", accountNumber: "" }
      ];
    },
  });
  
  // Get categories for dropdown based on transaction type
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories', isExpense],
    queryFn: async () => {
      // In a real app, we would fetch categories from the API
      // For demonstration, we'll return sample categories
      const expenseCategories = [
        { id: 1, name: 'مصاريف المنزل', isExpense: true, userId: 1, icon: 'ri-home-line', color: "#4CAF50" },
        { id: 2, name: 'السيارة والوقود', isExpense: true, userId: 1, icon: 'ri-gas-station-line', color: "#2196F3" },
        { id: 3, name: 'المطاعم', isExpense: true, userId: 1, icon: 'ri-restaurant-line', color: "#FF9800" },
        { id: 4, name: 'التسوق', isExpense: true, userId: 1, icon: 'ri-shopping-bag-line', color: "#F44336" },
        { id: 5, name: 'أخرى', isExpense: true, userId: 1, icon: 'ri-more-line', color: "#9E9E9E" }
      ];
      
      const incomeCategories = [
        { id: 6, name: 'راتب', isExpense: false, userId: 1, icon: 'ri-money-dollar-circle-line', color: "#4CAF50" },
        { id: 7, name: 'مكافأة', isExpense: false, userId: 1, icon: 'ri-award-line', color: "#2196F3" },
        { id: 8, name: 'استثمار', isExpense: false, userId: 1, icon: 'ri-line-chart-line', color: "#FF9800" },
        { id: 9, name: 'هدية', isExpense: false, userId: 1, icon: 'ri-gift-line', color: "#E91E63" },
        { id: 10, name: 'أخرى', isExpense: false, userId: 1, icon: 'ri-more-line', color: "#9E9E9E" }
      ];
      
      return isExpense ? expenseCategories : incomeCategories;
    },
  });
  
  // Initialize form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      accountId: accounts?.[0]?.id.toString() || "",
      categoryId: "",
      isExpense,
      date: new Date().toISOString().split('T')[0],
      note: "",
    },
  });
  
  // Update form when isExpense changes
  React.useEffect(() => {
    form.setValue('isExpense', isExpense);
    form.setValue('categoryId', "");
  }, [isExpense, form]);
  
  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: async (data: Omit<InsertTransaction, 'userId'>) => {
      const res = await apiRequest('POST', '/api/transactions', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      onClose();
      form.reset();
    },
  });
  
  const onSubmit = (values: TransactionFormValues) => {
    const numericAmount = parseFloat(values.amount) * 100; // Convert to lowest denomination
    
    addTransactionMutation.mutate({
      ...values,
      accountId: parseInt(values.accountId),
      categoryId: parseInt(values.categoryId),
      amount: numericAmount,
    });
  };

  if (isLoadingAccounts || isLoadingCategories) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>إضافة معاملة جديدة</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel>نوع المعاملة</FormLabel>
              <div className="flex gap-3 mt-1">
                <Button 
                  type="button"
                  className={`flex-1 ${!isExpense ? 'bg-success text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                  onClick={() => setIsExpense(false)}
                >
                  دخل
                </Button>
                <Button 
                  type="button"
                  className={`flex-1 ${isExpense ? 'bg-danger text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                  onClick={() => setIsExpense(true)}
                >
                  مصروف
                </Button>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="0"
                        className="pr-4 pl-14" 
                        {...field} 
                      />
                      <span className="absolute left-4 top-2 text-gray-500">ريال</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التصنيف</FormLabel>
                  <Select 
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center gap-2">
                            <i className={category.icon}></i>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحساب</FormLabel>
                  <Select 
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحساب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map(account => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التاريخ</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أضف ملاحظاتك هنا..."
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex gap-3 mt-6">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={addTransactionMutation.isPending}
              >
                {addTransactionMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    جاري الحفظ...
                  </span>
                ) : (
                  "حفظ المعاملة"
                )}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
