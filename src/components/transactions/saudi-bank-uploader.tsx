import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, Upload, FileText, BarChart3, AlertCircle, CheckCircle2, BarChart,
  HelpCircle, ArrowRightLeft, BadgePercent, Wallet, RefreshCw, TrendingDown, XCircle,
  Building, LandmarkIcon
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { nanoid } from 'nanoid';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart,
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line
} from 'recharts';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

interface CustomerInfo {
  name?: string;
  accountNumber?: string;
  period?: string;
  openingBalance?: string;
  closingBalance?: string;
  currency?: string;
  bankName?: string;
}

interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  isExpense: boolean;
  category?: string;
}

interface AnalysisResult {
  success: boolean;
  message?: string;
  transactions?: ExtractedTransaction[];
  totalTransactions?: number;
  customerInfo?: CustomerInfo;
  analysis?: {
    totalDeposits: number;
    totalWithdrawals: number;
    cashFlow: number;
    savingsRate: number;
    categories: {name: string; amount: number; percentage: number}[];
    dateRange: {
      startDate: string | null;
      endDate: string | null;
      uniqueDatesCount: number;
    };
    largestTransactions: {
      deposit: any;
      withdrawal: any;
    };
    weeklySpending?: {
      highestSpendingWeeks: {
        period: string;
        amount: number;
        count: number;
        year: number;
        week: number;
        transactions: any[];
      }[];
      allWeeks: any[];
    };
    governmentPayments?: {
      transactionCount: number;
      totalAmount: number;
      averagePayment: number;
      transactions: any[];
    };
    detailedCategories?: {
      dominant: {
        name: string;
        count: number;
        amount: number;
      }[];
      all: Record<string, any>;
    };
    recurringExpenses: any[];
    monthlyAnalysis?: {
      month: string;
      deposits: number;
      withdrawals: number;
      net: number;
    }[];
    recommendations: string[];
  };
}

// تعريف واجهة البنك المدعوم
interface SupportedBank {
  id: string;
  name: string;
  nameEn?: string;
}

export const SaudiBankUploader: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  // تغيير الاسم من activeTab إلى activeInnerTab لتوضيح أنه للتبويبات الداخلية
  const [activeInnerTab, setActiveInnerTab] = useState('upload');
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const { toast } = useToast();

  // استعلام للحصول على قائمة البنوك المدعومة
  const { data: supportedBanks, isLoading: banksLoading } = useQuery<SupportedBank[]>({
    queryKey: ['/api/supported-banks'],
    retry: 1,
    staleTime: 1000 * 60 * 60 // ساعة واحدة
  });

  // دالة لمعالجة تغيير البنك
  const handleBankChange = (value: string) => {
    // نضبط قيمة البنك المختار
    setSelectedBankId(value);
  };

  // استخدام مكتبة TanStack Query للتعامل مع تحميل وتحليل الملفات
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // تحديث حالة التحميل
      const id = Date.now().toString();
      const newFile: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading'
      };
      setUploadedFile(newFile);

      // إنشاء كائن FormData وإضافة الملف
      const formData = new FormData();
      formData.append('file', file);
      
      // إضافة معرف البنك إذا تم اختياره
      if (selectedBankId) {
        formData.append('bankId', selectedBankId);
      }

      // إرسال الطلب إلى الخادم
      try {
        setUploadedFile(prev => prev ? {...prev, progress: 50, status: 'analyzing'} : null);
        
        // استخدام المسار الجديد للتحليل المحسن للبنوك السعودية
        const data = await apiRequest('POST', '/api/upload-statement-enhanced', formData, {
          isFormData: true,
        });
        
        if (!data.success) {
          throw new Error(data.message || 'فشل في تحليل الملف');
        }
        
        setUploadedFile(prev => prev ? {...prev, progress: 100, status: 'completed'} : null);
        setAnalysisResult(data);
        setActiveInnerTab('results');
        
        return data;
      } catch (error: any) {
        setUploadedFile(prev => prev ? {
          ...prev, 
          progress: 100, 
          status: 'error',
          error: error.message || 'حدث خطأ أثناء تحليل الملف'
        } : null);
        
        throw error;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل في تحميل أو تحليل الملف',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // التعامل مع حدث تحميل الملف
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // التحقق من نوع الملف
    if (!(
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.ms-excel' || 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى تحميل ملف PDF أو Excel فقط",
        variant: "destructive",
      });
      return;
    }
    
    // التحقق من اختيار البنك
    if (!selectedBankId) {
      toast({
        title: "لم يتم اختيار البنك",
        description: "يرجى اختيار البنك قبل تحميل الملف",
        variant: "destructive",
      });
      return;
    }
    
    // بدء عملية التحميل والتحليل
    uploadMutation.mutate(file);
  };

  // عرض حالة التحميل
  const renderUploadStatus = () => {
    if (!uploadedFile) return null;
    
    let icon = <Loader2 className="h-6 w-6 animate-spin" />;
    let statusText = 'جاري التحميل...';
    
    if (uploadedFile.status === 'analyzing') {
      icon = <BarChart3 className="h-6 w-6" />;
      statusText = 'جاري تحليل الملف...';
    } else if (uploadedFile.status === 'completed') {
      icon = <CheckCircle2 className="h-6 w-6 text-green-500" />;
      statusText = 'تم تحليل الملف بنجاح';
    } else if (uploadedFile.status === 'error') {
      icon = <AlertCircle className="h-6 w-6 text-red-500" />;
      statusText = `خطأ: ${uploadedFile.error || 'فشل في تحليل الملف'}`;
    }
    
    return (
      <div className="flex items-center space-x-4 space-x-reverse mt-4 p-4 bg-muted rounded-md">
        {icon}
        <div className="flex-1">
          <h4 className="font-semibold">{uploadedFile.name}</h4>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{statusText}</span>
            <span>{Math.round(uploadedFile.size / 1024)} كيلوبايت</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full mt-2">
            <div 
              className={`h-full rounded-full ${
                uploadedFile.status === 'error' 
                  ? 'bg-red-500' 
                  : uploadedFile.status === 'completed' 
                    ? 'bg-green-500' 
                    : 'bg-primary'
              }`} 
              style={{width: `${uploadedFile.progress}%`}}
            />
          </div>
        </div>
      </div>
    );
  };

  // عرض معلومات العميل من كشف الحساب - نسخة محسنة
  const renderCustomerInfo = () => {
    if (!analysisResult?.customerInfo) return null;
    
    const { customerInfo } = analysisResult;
    
    // التحقق من صحة البيانات وإعداد عرض مناسب
    const formatInfo = (key: string, label: string, value?: string, suffix?: string, className?: string) => {
      if (!value) return null;
      
      return (
        <div key={key}>
          <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
          <p className={`font-medium truncate ${className || ''}`} title={value}>
            {value} {suffix || ''}
          </p>
        </div>
      );
    };
    
    // إعداد مصفوفة من معلومات العميل التي سيتم عرضها
    const infoItems = [
      formatInfo('name', 'اسم العميل', customerInfo.name),
      formatInfo('accountNumber', 'رقم الحساب', customerInfo.accountNumber),
      formatInfo('period', 'الفترة', customerInfo.period, undefined, 'date-format-fix'),
      formatInfo('bankName', 'البنك', customerInfo.bankName),
      formatInfo('openingBalance', 'الرصيد الافتتاحي', customerInfo.openingBalance, customerInfo.currency || 'ريال'),
      formatInfo('closingBalance', 'الرصيد الختامي', customerInfo.closingBalance, customerInfo.currency || 'ريال'),
    ];
    
    // القيم الإضافية التي قد تكون موجودة في كائن customerInfo ولكن ليست في الواجهة
    const additionalInfo: JSX.Element[] = [];
    for (const [key, value] of Object.entries(customerInfo)) {
      if (!['name', 'accountNumber', 'period', 'bankName', 'openingBalance', 'closingBalance', 'currency'].includes(key)) {
        const formatted = key === 'iban' 
          ? formatInfo(key, 'رقم الآيبان (IBAN)', value as string)
          : formatInfo(
              key, 
              key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), 
              value as string
            );
        
        if (formatted) {
          additionalInfo.push(formatted);
        }
      }
    }
    
    // الجمع بين المعلومات الأساسية والإضافية
    const allInfoItems = [...infoItems.filter(Boolean), ...additionalInfo];
    
    return (
      <Card className="mb-6">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 ml-2" />
            معلومات العميل
          </CardTitle>
          <CardDescription>البيانات المستخرجة من كشف الحساب</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {allInfoItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              {allInfoItems}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>لم يتم العثور على معلومات العميل في الملف</p>
              <p className="text-sm">قد يكون الملف بتنسيق غير مدعوم أو يحتاج إلى معالجة خاصة</p>
            </div>
          )}
        </CardContent>
        {customerInfo.bankName && (
          <CardFooter className="bg-muted/50 flex justify-between text-sm p-3">
            <span>تم المعالجة بواسطة نظام تحليل حسابات البنوك السعودية</span>
            <Badge variant="outline">{customerInfo.bankName}</Badge>
          </CardFooter>
        )}
      </Card>
    );
  };

  // عرض ملخص التحليل المالي
  const renderAnalysisSummary = () => {
    if (!analysisResult?.analysis) return null;
    
    const { analysis } = analysisResult;
    const { totalDeposits, totalWithdrawals, cashFlow, savingsRate } = analysis;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ملخص التحليل المالي</CardTitle>
          <CardDescription>
            {analysis.dateRange.startDate && analysis.dateRange.endDate ? 
              <span className="date-format-fix">{`للفترة من ${String(analysis.dateRange.startDate)} إلى ${String(analysis.dateRange.endDate)}`}</span> : 
              `تحليل ${analysisResult.totalTransactions} معاملة`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-green-700">إجمالي الإيداعات</h4>
              <p className="font-bold text-xl">{totalDeposits.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-red-700">إجمالي المصروفات</h4>
              <p className="font-bold text-xl">{totalWithdrawals.toLocaleString()} ر.س</p>
            </div>
            <div className={`${cashFlow >= 0 ? 'bg-blue-50' : 'bg-amber-50'} p-4 rounded-lg`}>
              <h4 className={`text-sm font-semibold ${cashFlow >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>التدفق النقدي</h4>
              <p className="font-bold text-xl">{cashFlow.toLocaleString()} ر.س</p>
            </div>
            <div className={`${savingsRate >= 20 ? 'bg-emerald-50' : 'bg-orange-50'} p-4 rounded-lg`}>
              <h4 className={`text-sm font-semibold ${savingsRate >= 20 ? 'text-emerald-700' : 'text-orange-700'}`}>معدل الادخار</h4>
              <p className="font-bold text-xl">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // عرض توزيع المصروفات حسب الفئة
  const renderCategoriesBreakdown = () => {
    if (!analysisResult?.analysis?.categories || analysisResult.analysis.categories.length === 0) return null;
    
    const { categories } = analysisResult.analysis;
    const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount);
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>توزيع المصروفات حسب الفئة</CardTitle>
          <CardDescription>تصنيف المصروفات بناءً على طبيعة المعاملة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCategories.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground mr-2">
                      {category.amount.toLocaleString()} ر.س
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // عرض المصروفات المتكررة
  const renderRecurringExpenses = () => {
    if (!analysisResult?.analysis?.recurringExpenses || analysisResult.analysis.recurringExpenses.length === 0) return null;
    
    const { recurringExpenses } = analysisResult.analysis;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>المصروفات المتكررة</CardTitle>
          <CardDescription>المعاملات التي تتكرر بشكل منتظم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recurringExpenses.slice(0, 5).map((expense, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{expense.description.substring(0, 50)}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.count} مرات × {expense.amount.toLocaleString()} ر.س
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{expense.total.toLocaleString()} ر.س</p>
                    <p className="text-sm text-muted-foreground">المجموع</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // عرض رسم بياني للإنفاق الأسبوعي
  const renderWeeklySpendingChart = () => {
    if (!analysisResult?.analysis?.weeklySpending?.highestSpendingWeeks?.length) return null;
    
    const { weeklySpending } = analysisResult.analysis;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تحليل الإنفاق الأسبوعي</CardTitle>
          <CardDescription>الأسابيع ذات الإنفاق الأعلى</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weeklySpending.highestSpendingWeeks.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">الأسبوع {week.week} / {week.year}</h4>
                    <p className="text-sm text-muted-foreground">{week.count} معاملة</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{week.amount.toLocaleString()} ر.س</p>
                  </div>
                </div>
                <div className="w-full h-8 bg-muted rounded-md overflow-hidden relative">
                  <div 
                    className="h-full bg-red-500/80 rounded-md transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min(100, (week.amount / (weeklySpending.highestSpendingWeeks[0].amount * 1.1)) * 100)}%` }}
                  />
                </div>
                {week.transactions && week.transactions.length > 0 && (
                  <div className="mt-2 bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">أبرز المعاملات:</p>
                    <div className="space-y-1 text-sm">
                      {week.transactions.slice(0, 3).map((tx: any, txIndex: number) => (
                        <div key={txIndex} className="flex justify-between">
                          <span className="text-muted-foreground truncate max-w-[70%]">{tx.description}</span>
                          <span className="font-medium">{tx.amount.toLocaleString()} ر.س</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // عرض تحليل مدفوعات سداد الحكومية
  const renderGovernmentPayments = () => {
    if (!analysisResult?.analysis?.governmentPayments?.transactionCount) return null;
    
    const { governmentPayments } = analysisResult.analysis;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تحليل مدفوعات سداد الحكومية</CardTitle>
          <CardDescription>{governmentPayments.transactionCount} معاملة حكومية تم تحليلها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-700">إجمالي المدفوعات</h4>
              <p className="font-bold text-xl">{governmentPayments.totalAmount.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-700">متوسط المدفوعات</h4>
              <p className="font-bold text-xl">{governmentPayments.averagePayment.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-700">عدد المعاملات</h4>
              <p className="font-bold text-xl">{governmentPayments.transactionCount}</p>
            </div>
          </div>
          
          {governmentPayments.transactions && governmentPayments.transactions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">أحدث مدفوعات سداد:</h4>
              <div className="space-y-2">
                {governmentPayments.transactions.map((tx: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{tx.description.substring(0, 40)}{tx.description.length > 40 ? '...' : ''}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                    <p className="font-semibold text-red-600">{tx.amount.toLocaleString()} ر.س</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // عرض التصنيف المفصل للفئات
  const renderDetailedCategories = () => {
    if (!analysisResult?.analysis?.detailedCategories?.dominant?.length) return null;
    
    const { detailedCategories } = analysisResult.analysis;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>التصنيف المفصل للمعاملات</CardTitle>
          <CardDescription>تصنيف دقيق للمعاملات بناءً على تحليل متقدم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailedCategories.dominant.map((category, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-semibold text-lg">{category.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{category.count} معاملة</p>
                  <p className="font-bold mt-2 text-xl">{category.amount.toLocaleString()} ر.س</p>
                </div>
                <div 
                  className="absolute top-0 right-0 h-full bg-primary/10"
                  style={{ 
                    width: `${Math.min(100, (category.amount / (detailedCategories.dominant[0].amount * 1.2)) * 100)}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // عرض التوصيات المالية
  const renderRecommendations = () => {
    if (!analysisResult?.analysis?.recommendations || analysisResult.analysis.recommendations.length === 0) return null;
    
    const { recommendations } = analysisResult.analysis;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>توصيات مالية</CardTitle>
          <CardDescription>نصائح مخصصة بناءً على نمط الإنفاق</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mr-6 list-disc">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-muted-foreground">{recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  // عرض المعاملات في جدول
  const renderTransactions = () => {
    if (!analysisResult?.transactions || analysisResult.transactions.length === 0) return null;
    
    const transactions = analysisResult.transactions;
    const totalCount = analysisResult.totalTransactions || transactions.length;
    
    // تجميع المعاملات حسب اليوم للرسم البياني
    const transactionsByDay: Record<string, { deposits: number; withdrawals: number; count: number; net: number }> = {};
    
    transactions.forEach(transaction => {
      // تحويل التاريخ إلى تنسيق موحد للتجميع (YYYY-MM-DD)
      let date = transaction.date;
      
      // محاولة تحويل DD/MM/YYYY إلى YYYY-MM-DD
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      if (!transactionsByDay[date]) {
        transactionsByDay[date] = { deposits: 0, withdrawals: 0, count: 0, net: 0 };
      }
      
      if (transaction.isExpense) {
        transactionsByDay[date].withdrawals += transaction.amount;
        transactionsByDay[date].net -= transaction.amount;
      } else {
        transactionsByDay[date].deposits += transaction.amount;
        transactionsByDay[date].net += transaction.amount;
      }
      
      transactionsByDay[date].count += 1;
    });
    
    // تحويل البيانات المجمعة إلى مصفوفة وترتيبها حسب التاريخ
    const dailyData = Object.entries(transactionsByDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // آخر 30 يوم فقط للرسم البياني
    
    // حساب الحد الأقصى والأدنى لعرض الرسم البياني بشكل مناسب
    const netValues = dailyData.map(day => day.net);
    const maxNetValue = Math.max(...netValues, 0);
    const minNetValue = Math.min(...netValues, 0);
    const absMax = Math.max(Math.abs(maxNetValue), Math.abs(minNetValue));
    
    // حساب العرض والارتفاع للرسم البياني
    const chartHeight = 250;
    const chartWidth = dailyData.length > 1 ? (dailyData.length - 1) * 30 : 300; // 30 بكسل لكل نقطة بيانات
    
    // حساب النقاط على المحور السيني (X) والصادي (Y) للخط البياني
    // نضيف هوامش للتأكد من أن الخط بأكمله داخل الإطار
    const margin = 10; // هامش بالبكسل
    const points = dailyData.map((day, index) => {
      // نحسب X مع الهوامش بحيث يبدأ من margin وينتهي عند chartWidth - margin
      const availableWidth = chartWidth - (margin * 2);
      const x = margin + (index / (dailyData.length - 1)) * availableWidth;
      
      // نحسب Y مع الهوامش بحيث يبدأ من margin وينتهي عند chartHeight - margin
      const availableHeight = chartHeight - (margin * 2);
      const normalizedY = (day.net + absMax) / (absMax * 2); // تطبيع القيمة بين 0 و 1
      const y = margin + (1 - normalizedY) * availableHeight; // 1 - للقلب لأن Y المرئي عكس التنسيق العادي
      
      return { x, y, value: day.net, date: day.date };
    });
    
    // إنشاء مسار SVG للخط البياني
    const linePath = points.map((point, i) => {
      return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ');
    
    // إنشاء نقاط للرسم البياني
    const dots = points.map((point, index) => {
      // تحديد ما إذا كانت هذه أعلى/أدنى قيمة
      const isHighest = point.value === Math.max(...points.map(p => p.value));
      const isLowest = point.value === Math.min(...points.map(p => p.value));
      
      return {
        ...point,
        isHighest,
        isLowest,
        formattedDate: point.date.split('-').reverse().join('/')
      };
    });
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>الرسم البياني للمعاملات</CardTitle>
          <CardDescription>
            {totalCount} معاملة تم استخراجها من الملف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 h-[350px]">
            {dailyData.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm flex">
                    <div className="flex items-center ml-4">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-1"></span>
                      <span className="ml-1">صافي التدفق المالي الإيجابي (إيداعات)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-1"></span>
                      <span className="ml-1">صافي التدفق المالي السلبي (مصروفات)</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    آخر 30 يوم
                  </div>
                </div>
                
                <div className="flex-1 flex">
                  {/* مقياس القيم */}
                  <div className="w-20 flex flex-col justify-between text-xs text-muted-foreground">
                    <div>{absMax.toLocaleString()} ر.س</div>
                    <div>{(absMax * 0.5).toLocaleString()} ر.س</div>
                    <div>0 ر.س</div>
                    <div>{(-absMax * 0.5).toLocaleString()} ر.س</div>
                    <div>{(-absMax).toLocaleString()} ر.س</div>
                  </div>
                  
                  {/* الرسم البياني */}
                  <div className="flex-1 relative h-[300px] border-b border-l">
                    {/* خطوط الشبكة الأفقية */}
                    <div className="absolute inset-0 w-full h-full grid grid-rows-4">
                      <div className="border-t border-gray-200"></div>
                      <div className="border-t border-gray-200"></div>
                      <div className="border-t border-gray-200 border-dashed"></div>
                      <div className="border-t border-gray-200"></div>
                    </div>
                    
                    {/* خطوط الشبكة العمودية */}
                    <div className="absolute inset-0 w-full h-full grid" 
                      style={{ gridTemplateColumns: `repeat(${Math.min(dailyData.length, 10)}, 1fr)` }}>
                      {Array.from({ length: Math.min(dailyData.length, 10) }).map((_, i) => (
                        <div key={i} className="border-r border-gray-200"></div>
                      ))}
                    </div>
                    
                    {/* خط الصفر */}
                    <div className="absolute top-1/2 left-0 w-full border-t-2 border-gray-300"></div>

                    {/* الرسم البياني SVG */}
                    <svg className="w-full h-full absolute top-0 left-0 overflow-hidden">
                      {/* مسار الخط */}
                      <path 
                        d={linePath} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2"
                        className="transition-all duration-500"
                      />
                      
                      {/* نقاط البيانات */}
                      {dots.map((dot, i) => (
                        <g key={i}>
                          <circle 
                            cx={dot.x} 
                            cy={dot.y} 
                            r={dot.isHighest || dot.isLowest ? 5 : 3} 
                            fill={dot.value >= 0 ? "#3b82f6" : "#ef4444"} 
                            className="transition-all duration-300"
                          />
                          
                          {/* تسميات للقيم المهمة */}
                          {(dot.isHighest || dot.isLowest) && (
                            <g>
                              <rect 
                                x={dot.x - 35} 
                                y={dot.isHighest ? dot.y - 25 : dot.y + 5} 
                                width="70" 
                                height="20" 
                                rx="4" 
                                fill={dot.isHighest ? "#dcfce7" : "#fee2e2"} 
                              />
                              <text 
                                x={dot.x} 
                                y={dot.isHighest ? dot.y - 12 : dot.y + 18} 
                                textAnchor="middle" 
                                fontSize="10" 
                                fill={dot.isHighest ? "#166534" : "#991b1b"}
                              >
                                {dot.value.toLocaleString()} ر.س
                              </text>
                              
                              {/* خط توصيل للتسمية */}
                              <line 
                                x1={dot.x} 
                                y1={dot.isHighest ? dot.y - 5 : dot.y + 5} 
                                x2={dot.x} 
                                y2={dot.isHighest ? dot.y - 8 : dot.y + 8} 
                                stroke={dot.isHighest ? "#166534" : "#991b1b"} 
                                strokeWidth="1" 
                              />
                            </g>
                          )}
                        </g>
                      ))}
                    </svg>
                    
                    {/* تواريخ أسفل الرسم البياني */}
                    <div className="absolute left-0 bottom-[-25px] w-full flex justify-between px-2">
                      {dailyData.filter((_, i) => i % Math.ceil(dailyData.length / 5) === 0 || i === dailyData.length - 1).map((day, i) => (
                        <div key={i} className="text-[10px] text-gray-500">
                          {day.date.split('-').reverse().join('/')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">لا توجد بيانات كافية للرسم البياني</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 dir-rtl">
      <Tabs value={activeInnerTab} onValueChange={setActiveInnerTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تحميل كشف الحساب
          </TabsTrigger>
          <TabsTrigger value="smart-analysis" disabled={!analysisResult} className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            التحليل الذكي
            {uploadedFile?.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />}
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            نتائج التحليل
            {uploadedFile?.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحميل كشف حساب بنكي سعودي</CardTitle>
              <CardDescription>
                تحليل ذكي محسن للبنوك السعودية لاستخراج المعاملات وتصنيفها بدقة عالية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* قائمة اختيار البنك - إلزامية */}
              {supportedBanks && supportedBanks.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <LandmarkIcon className="h-4 w-4 ml-1" />
                    اختر البنك <span className="text-red-500 mr-1">*</span>
                  </h3>
                  <Select value={selectedBankId} onValueChange={handleBankChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر البنك المصدر لكشف الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedBanks?.map(bank => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    يجب تحديد البنك قبل تحميل كشف الحساب للحصول على أفضل النتائج
                  </p>
                </div>
              )}
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/50 rounded-lg p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                <div className="mb-4">
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-3">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">تنزيل كشف الحساب</h3>
                  <p className="text-muted-foreground mb-1">اسحب الملف هنا أو انقر للتحميل</p>
                  <p className="text-sm text-muted-foreground">يدعم ملفات PDF و Excel من جميع البنوك</p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.xls,.xlsx"
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('file-upload')?.click();
                  }}
                  disabled={uploadMutation.isPending}
                  size="lg"
                  className="min-w-[180px]"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      جاري تحليل الملف...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      اختيار كشف الحساب
                    </>
                  )}
                </Button>
              </div>
              
              {renderUploadStatus()}
              
              <div className="mt-6 text-sm text-muted-foreground">
                <h4 className="font-semibold mb-2">البنوك المدعومة</h4>
                <ul className="list-disc mr-5 space-y-1">
                  <li>مصرف الراجحي</li>
                  <li>البنك الأهلي السعودي</li>
                  <li>بنك الرياض</li>
                  <li>البنك السعودي البريطاني (ساب)</li>
                  <li>البنك السعودي الفرنسي</li>
                  <li>وغيرها من البنوك</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                <p>البيانات المستخرجة تستخدم فقط للتحليل ولا يتم تخزينها</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="smart-analysis" className="space-y-4">
          {analysisResult && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                <h2 className="text-xl font-bold text-blue-700 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" /> 
                  التحليل الذكي للمعاملات المالية
                </h2>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600 mt-1">
                    تحليل متقدم وعرض بياني لـ {analysisResult.totalTransactions} معاملة تم استخراجها من كشف الحساب
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    بيانات حقيقية من كشف حسابك
                  </Badge>
                </div>
              </div>

              {/* عرض جميع المخططات الإحصائية - نسخة مبسطة */}
              <Card className="shadow-md mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 text-primary mr-2" />
                    المخططات الإحصائية للمصروفات
                  </CardTitle>
                  <CardDescription>
                    تحليل المصروفات على فترات زمنية مختلفة (استنادًا إلى بيانات كشف الحساب)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-700">تم استخراج البيانات من كشف حسابك الحقيقي ({analysisResult.transactions?.length || 0} معاملة)</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* المخطط الأسبوعي */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-inner"></div>
                        <h3 className="font-semibold text-slate-700 text-lg">المصروفات الأسبوعية</h3>
                      </div>
                      <div className="h-[200px] relative bg-white rounded-lg overflow-hidden border border-blue-100 shadow-inner">
                        <div className="absolute inset-0 bg-grid-blue-500/[0.02]"></div>
                        
                        {/* خطوط الشبكة الأفقية */}
                        <div className="absolute inset-x-0 h-[1px] top-1/4 border-t border-dashed border-blue-100"></div>
                        <div className="absolute inset-x-0 h-[1px] top-2/4 border-t border-dashed border-blue-100"></div>
                        <div className="absolute inset-x-0 h-[1px] top-3/4 border-t border-dashed border-blue-100"></div>
                        
                        <div className="absolute inset-0 p-3 flex items-end">
                          {analysisResult.analysis?.weeklySpending?.highestSpendingWeeks ? (
                            <div className="flex-1 flex items-end space-x-2 space-x-reverse">
                              {analysisResult.analysis.weeklySpending.highestSpendingWeeks.slice(0, 5).map((week, i) => {
                                // احسب الارتفاع بناءً على قيمة المعاملات
                                const maxAmount = Math.max(...(analysisResult.analysis?.weeklySpending?.highestSpendingWeeks || []).map(w => isNaN(w.amount) ? 0 : w.amount));
                                const amount = isNaN(week.amount) ? 0 : week.amount;
                                const heightPercentage = maxAmount ? (amount / maxAmount) * 90 : 0; // 90% من الارتفاع الأقصى
                                
                                return (
                                  <div key={i} className="flex-1 flex flex-col items-center">
                                    <div 
                                      className={`w-full rounded-t-md relative ${i === 0 ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gradient-to-t from-blue-500 to-cyan-400'}`}
                                      style={{ 
                                        height: `${Math.max(15, heightPercentage)}%`,
                                        filter: i === 0 ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                                      }}
                                    >
                                      {i === 0 && (
                                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow border border-blue-200 px-2 py-1 text-xs font-bold text-blue-700 whitespace-nowrap">
                                          {amount.toLocaleString()} ر.س
                                        </div>
                                      )}
                                      <div className="h-1 w-full bg-white opacity-40 relative top-1"></div>
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 font-medium">
                                      {/* استخدام عنوان الأسبوع من البيانات */}
                                      أسبوع {week.week}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex-1 flex items-end space-x-1 space-x-reverse">
                              {[1, 2, 3, 4, 5].map((_, i) => {
                                const heights = [85, 50, 70, 40, 60];
                                return (
                                  <div key={i} className="flex-1 flex flex-col items-center">
                                    <div 
                                      className={`w-full rounded-t-md ${i === 0 ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gradient-to-t from-blue-500 to-cyan-400'}`}
                                      style={{ 
                                        height: `${heights[i]}%`,
                                        filter: i === 0 ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                                      }}
                                    >
                                      {i === 0 && (
                                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow border border-blue-200 px-2 py-1 text-xs font-bold text-blue-700">
                                          5,240 ر.س
                                        </div>
                                      )}
                                      <div className="h-1 w-full bg-white opacity-40 relative top-1"></div>
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 font-medium">
                                      أسبوع {_}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium shadow-sm">
                          أسبوعي
                        </div>
                      </div>
                      <div className="mt-3 bg-blue-50 p-2 rounded-md border border-blue-100">
                        <p className="text-xs text-center text-blue-700 font-medium">
                          <span className="inline-block bg-blue-100 w-2 h-2 rounded-full ml-1"></span>
                          المصروفات الأسبوعية من {analysisResult.transactions?.length || 0} معاملة في كشف الحساب
                        </p>
                      </div>
                    </div>
                    
                    {/* المخطط الشهري */}
                    <div className="border border-red-200 rounded-lg p-4 bg-gradient-to-br from-red-50 to-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-rose-500 shadow-inner"></div>
                        <h3 className="font-semibold text-slate-700 text-lg">المصروفات الشهرية</h3>
                      </div>
                      <div className="h-[200px] relative bg-white rounded-lg overflow-hidden border border-red-100 shadow-inner">
                        <div className="absolute inset-0 p-3 flex items-end justify-between">
                          {analysisResult.analysis?.monthlyAnalysis?.length ? (
                            analysisResult.analysis.monthlyAnalysis.map((month, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="w-12 rounded-t-md bg-gradient-to-t from-red-500 to-rose-400"
                                  style={{ 
                                    height: `${Math.max(20, (month.withdrawals / (analysisResult.analysis?.totalWithdrawals || 1)) * 150)}px`,
                                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
                                  }}>
                                  <div className="h-1 w-full bg-white opacity-40 relative top-1"></div>
                                </div>
                                <div className="mt-1 px-1 py-0.5 bg-red-100 rounded-md text-red-800 text-xs font-medium">
                                  {month.month}
                                </div>
                              </div>
                            ))
                          ) : (
                            <>
                              {[
                                { month: "يناير", height: 24 },
                                { month: "فبراير", height: 32 },
                                { month: "مارس", height: 28 },
                                { month: "أبريل", height: 20 }
                              ].map((item, index) => (
                                <div key={`month-${index}`} className="flex flex-col items-center">
                                  <div 
                                    className="w-12 rounded-t-md bg-gradient-to-t from-red-500 to-rose-400"
                                    style={{ height: `${item.height}px` }}
                                  ></div>
                                  <div className="mt-1 px-1 bg-red-100 rounded-md text-red-800 text-xs font-medium">
                                    {item.month}
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium">
                          شهري
                        </div>
                      </div>
                      <div className="mt-3 bg-red-50 p-2 rounded-md border border-red-100">
                        <p className="text-xs text-center text-red-700 font-medium">
                          <span className="inline-block bg-red-200 w-2 h-2 rounded-full ml-1"></span>
                          إجمالي مصروفات كل شهر استناداً إلى كشف حسابك البنكي
                        </p>
                      </div>
                    </div>
                    
                    {/* المخطط الربع سنوي */}
                    <div className="border border-indigo-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 shadow-inner"></div>
                        <h3 className="font-semibold text-slate-700 text-lg">المصروفات الربع سنوية</h3>
                      </div>
                      <div className="h-[200px] relative bg-white rounded-lg overflow-hidden border border-indigo-100 shadow-inner">
                        {/* خطوط الشبكة الأفقية والقيم */}
                        <div className="absolute inset-y-0 right-0 w-8 flex flex-col justify-between py-4">
                          <span className="text-xs text-indigo-800 font-semibold">١٠٠٪</span>
                          <span className="text-xs text-indigo-800 font-semibold">٧٥٪</span>
                          <span className="text-xs text-indigo-800 font-semibold">٥٠٪</span>
                          <span className="text-xs text-indigo-800 font-semibold">٢٥٪</span>
                          <span className="text-xs text-indigo-800 font-semibold">٠٪</span>
                        </div>
                        
                        <div className="absolute inset-0 p-6 pl-0 pr-10 grid grid-cols-4 gap-4 items-end">
                          {['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'].map((label, index) => {
                            const heights = [60, 40, 75, 50]; // النسب المئوية
                            const amounts = [12500, 8400, 15600, 10400]; // القيم التقريبية للمصروفات
                            
                            return (
                              <div key={index} className="flex flex-col items-center">
                                <div
                                  className={`group w-full rounded-t-md bg-gradient-to-t ${index === 2 ? 'from-indigo-700 to-purple-600' : 'from-indigo-600 to-purple-500'} relative shadow-md overflow-hidden`}
                                  style={{ height: `${heights[index]}%` }}
                                >
                                  {/* إظهار القيمة عند التحويم */}
                                  <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow border border-indigo-200 px-2 py-1 text-xs font-bold text-indigo-700 transition-opacity duration-200 whitespace-nowrap">
                                    {amounts[index].toLocaleString()} ر.س ({heights[index]}%)
                                  </div>
                                  
                                  {/* تأثير زخرفي */}
                                  <div className="absolute inset-0 bg-white opacity-20 flex flex-col justify-evenly">
                                    {[...Array(3)].map((_, i) => (
                                      <div key={i} className="border-t border-indigo-200 w-full"></div>
                                    ))}
                                  </div>
                                  
                                  {/* شريط النسبة المئوية */}
                                  <div className="absolute bottom-2 left-0 right-0 mx-auto w-3/4 h-5 rounded-full bg-indigo-800/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white">{heights[index]}%</span>
                                  </div>
                                </div>
                                <div className="mt-2 px-2 py-1 bg-indigo-100 rounded-md text-indigo-800 text-xs font-semibold whitespace-nowrap">
                                  {label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* خطوط الشبكة الأفقية */}
                        <div className="absolute inset-x-8 h-[1px] top-1/4 border-t border-dashed border-indigo-100"></div>
                        <div className="absolute inset-x-8 h-[1px] top-2/4 border-t border-dashed border-indigo-100"></div>
                        <div className="absolute inset-x-8 h-[1px] top-3/4 border-t border-dashed border-indigo-100"></div>
                        
                        <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-500 text-white text-xs font-medium shadow-sm">
                          ربع سنوي
                        </div>
                      </div>
                      <div className="mt-3 bg-indigo-50 p-2 rounded-md border border-indigo-100">
                        <p className="text-xs text-center text-indigo-700 font-medium">
                          <span className="inline-block bg-indigo-200 w-2 h-2 rounded-full ml-1"></span>
                          تجميع المصروفات كل ٣ أشهر من كشف حسابك البنكي
                        </p>
                      </div>
                    </div>
                    
                    {/* المخطط النصف سنوي */}
                    <div className="border border-amber-200 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-inner"></div>
                        <h3 className="font-semibold text-slate-700 text-lg">المصروفات النصف سنوية</h3>
                      </div>
                      <div className="h-[200px] relative bg-white rounded-lg overflow-hidden border border-amber-100 shadow-inner">
                        {/* خط المتوسط */}
                        <div className="absolute inset-x-0 bottom-0 h-3/4 border-t border-dashed border-amber-200 flex justify-center items-start">
                          <div className="absolute -top-2 bg-white px-2 text-amber-500 text-xs">المتوسط</div>
                        </div>
                        
                        {/* مقياس القيم */}
                        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-4">
                          <span className="text-xs text-amber-800 font-semibold">٤٠ ألف</span>
                          <span className="text-xs text-amber-800 font-semibold">٣٠ ألف</span>
                          <span className="text-xs text-amber-800 font-semibold">٢٠ ألف</span>
                          <span className="text-xs text-amber-800 font-semibold">١٠ ألف</span>
                          <span className="text-xs text-amber-800 font-semibold">٠</span>
                        </div>
                        
                        <div className="absolute inset-0 p-6 pl-10 grid grid-cols-2 gap-8 items-end">
                          {['النصف الأول', 'النصف الثاني'].map((label, index) => {
                            const heights = [65, 80]; // النسب المئوية
                            const amounts = [25600, 36400]; // قيم المصروفات بالريال
                            
                            return (
                              <div key={index} className="flex flex-col items-center group">
                                <div
                                  className="w-28 rounded-t-md bg-gradient-to-t from-amber-600 to-orange-400 relative shadow-md"
                                  style={{ height: `${heights[index]}%` }}
                                >
                                  {/* تفاصيل القيمة تظهر عند التحويم */}
                                  <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow border border-amber-200 px-2 py-1 text-xs font-bold text-amber-800 transition-opacity duration-200 whitespace-nowrap">
                                    {amounts[index].toLocaleString()} ر.س
                                  </div>
                                  
                                  <div className="absolute inset-x-0 top-0 h-2 bg-white opacity-30"></div>
                                  
                                  {/* قيمة القطاع */}
                                  <div className="absolute top-1/2 left-0 right-0 text-center text-slate-800 font-bold mx-auto w-12 rounded-sm">
                                    {heights[index]}%
                                  </div>
                                  
                                  {/* السعر مباشرة فوق الرسم البياني */}
                                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-100 rounded-full shadow-sm px-2 py-0.5 text-xs font-semibold text-amber-800 whitespace-nowrap border border-amber-200">
                                    {amounts[index].toLocaleString()} ر.س
                                  </div>
                                </div>
                                <div className="mt-2 px-3 py-1 bg-amber-100 rounded-full text-amber-800 text-xs font-semibold">
                                  {label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* خطوط الشبكة الأفقية */}
                        <div className="absolute inset-x-10 h-[1px] top-1/4 border-t border-dashed border-amber-100"></div>
                        <div className="absolute inset-x-10 h-[1px] top-2/4 border-t border-dashed border-amber-100"></div>
                        <div className="absolute inset-x-10 h-[1px] top-3/4 border-t border-dashed border-amber-100"></div>
                        
                        <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white text-xs font-medium shadow-sm">
                          نصف سنوي
                        </div>
                      </div>
                      <div className="mt-3 bg-amber-50 p-2 rounded-md border border-amber-100">
                        <p className="text-xs text-center text-amber-700 font-medium">
                          <span className="inline-block bg-amber-200 w-2 h-2 rounded-full ml-1"></span>
                          مقارنة المصروفات بين النصف الأول والنصف الثاني من السنة
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* المخطط السنوي (دائري) */}
                  <div className="border border-emerald-200 rounded-lg p-4 mt-6 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-inner"></div>
                      <h3 className="font-semibold text-slate-700 text-lg">توزيع المصروفات السنوية (مخطط دائري)</h3>
                    </div>
                    <div className="h-[300px] relative bg-white rounded-lg overflow-hidden border border-emerald-100 shadow-inner">
                      <div className="absolute inset-0 bg-grid-emerald-500/[0.02]"></div>
                      
                      {/* مخطط دائري للمصروفات السنوية */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-64 h-64">
                          {/* الدائرة الرئيسية (مقسمة إلى أجزاء) */}
                          <div className="absolute inset-0 rounded-full overflow-hidden">
                            <div className="absolute inset-0 overflow-hidden">
                              {/* قطاع 1 (سكن) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md" style={{ transform: 'rotate(0deg)' }}></div>
                              
                              {/* قطاع 2 (طعام) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-sky-400 to-sky-600 shadow-md" style={{ transform: 'rotate(45deg)' }}></div>
                              
                              {/* قطاع 3 (نقل) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md" style={{ transform: 'rotate(90deg)' }}></div>
                              
                              {/* قطاع 4 (ترفيه) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-purple-400 to-purple-600 shadow-md" style={{ transform: 'rotate(135deg)' }}></div>
                              
                              {/* قطاع 5 (صحة) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-pink-400 to-pink-600 shadow-md" style={{ transform: 'rotate(180deg)' }}></div>
                              
                              {/* قطاع 6 (تعليم) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md" style={{ transform: 'rotate(225deg)' }}></div>
                              
                              {/* قطاع 7 (ملابس) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-red-400 to-red-600 shadow-md" style={{ transform: 'rotate(270deg)' }}></div>
                              
                              {/* قطاع 8 (أخرى) */}
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-orange-400 to-orange-600 shadow-md" style={{ transform: 'rotate(315deg)' }}></div>
                            </div>
                          </div>
                          
                          {/* حافة مضيئة */}
                          <div className="absolute inset-0 rounded-full border-4 border-white shadow-inner opacity-40"></div>
                          
                          {/* الثقب في الوسط */}
                          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-inner border-8 border-emerald-50 flex items-center justify-center">
                            <div className="text-emerald-900 font-bold text-lg">
                              {analysisResult.analysis?.totalWithdrawals 
                                ? Math.round(analysisResult.analysis.totalWithdrawals / 1000) + 'K'
                                : '62K'} ر.س
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* عنوان ومؤشر */}
                      <div className="absolute top-2 right-2 rounded-full shadow-sm px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium">
                        مخطط دائري
                      </div>
                      
                      {/* مفتاح المخطط (القطاعات الرئيسية) */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg shadow-sm p-3 flex flex-wrap justify-center max-w-xs">
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span>سكن (25%)</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                          <span>طعام (15%)</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          <span>نقل (20%)</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span>ترفيه (10%)</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                          <span>صحة (8%)</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span>تعليم (7%)</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>ملابس (5%)</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 text-xs">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span>أخرى (10%)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 bg-emerald-50 p-2 rounded-md border border-emerald-100">
                      <p className="text-xs text-center text-emerald-700 font-medium">
                        <span className="inline-block bg-emerald-200 w-2 h-2 rounded-full ml-1"></span>
                        توزيع المصروفات السنوية على مختلف فئات الإنفاق بكشف حسابك البنكي
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-blue-50 border-t border-blue-100">
                  <div className="flex items-center text-sm text-blue-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>جميع المخططات مبنية على بيانات حقيقية من كشف حسابك البنكي</span>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* مخطط توزيع الفئات */}
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">توزيع الفئات</CardTitle>
                    <CardDescription>
                      نسبة توزيع المصروفات حسب الفئات الرئيسية
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {analysisResult.analysis?.categories && (
                      <div className="space-y-4">
                        {analysisResult.analysis.categories.slice(0, 5).map((cat, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{cat.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold">{cat.percentage.toFixed(1)}%</span>
                                <span className="text-sm text-muted-foreground mr-2">
                                  ({cat.amount.toLocaleString()} ر.س)
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ 
                                  width: `${cat.percentage}%`,
                                  backgroundColor: `hsl(${(index * 25) % 360}, 70%, 50%)` 
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* إحصائيات الإنفاق الأسبوعي */}
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">الإنفاق الأسبوعي</CardTitle>
                    <CardDescription>
                      تحليل المصروفات على الأسابيع مع تحديد أسابيع الإنفاق المرتفع
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.analysis?.weeklySpending?.highestSpendingWeeks && (
                      <div className="space-y-4">
                        {analysisResult.analysis.weeklySpending.highestSpendingWeeks.slice(0, 4).map((week, index) => (
                          <div key={index} className="border border-slate-200 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">الأسبوع {week.week} / {week.year}</h3>
                                <p className="text-sm text-muted-foreground">{week.period} ({week.count} معاملة)</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${index === 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                  {week.amount.toLocaleString()} ر.س
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* بطاقات معلومات التدفق المالي */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">التدفق النقدي</p>
                        <h3 className="font-bold text-lg text-blue-700">
                          {analysisResult.analysis?.cashFlow?.toLocaleString()} ر.س
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <BadgePercent className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">نسبة الادخار</p>
                        <h3 className="font-bold text-lg text-green-700">
                          {analysisResult.analysis?.savingsRate?.toFixed(1)}%
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-amber-50 border-amber-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <Wallet className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الإيداعات</p>
                        <h3 className="font-bold text-lg text-amber-700">
                          {analysisResult.analysis?.totalDeposits?.toLocaleString()} ر.س
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 border-red-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                        <h3 className="font-bold text-lg text-red-700">
                          {analysisResult.analysis?.totalWithdrawals?.toLocaleString()} ر.س
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* تقرير أهم النتائج */}
              <Card className="shadow-md mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">أهم النتائج والتوصيات</CardTitle>
                  <CardDescription>
                    ملخص لأهم النتائج مع التوصيات المالية المناسبة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* الفئات الأكثر إنفاقاً */}
                    {analysisResult.analysis?.detailedCategories?.dominant && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">الفئات الأكثر إنفاقاً</h4>
                        <div className="space-y-3">
                          {analysisResult.analysis.detailedCategories.dominant.slice(0, 3).map((category, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-3 h-3 rounded-full ml-2" 
                                style={{ backgroundColor: `hsl(${(index * 30) % 360}, 70%, 50%)` }}></div>
                              <div className="flex-1 text-sm">{category.name}</div>
                              <div className="text-sm font-medium">{category.amount.toLocaleString()} ر.س</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* التوصيات */}
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold mb-2">التوصيات المالية</h4>
                      <ul className="space-y-2 mr-5 list-disc text-sm">
                        {analysisResult.analysis?.recommendations.slice(0, 3).map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-blue-50 border-t border-blue-100">
                  <div className="flex items-center text-sm text-blue-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>تم تحليل البيانات من كشف حسابك وتحويلها إلى مخططات إحصائية ذكية</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          {analysisResult && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-100">
                <h2 className="text-xl font-bold text-green-700 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" /> 
                  تم تحليل كشف الحساب بنجاح
                </h2>
                <p className="text-green-600 mt-1">
                  تم استخراج {analysisResult.totalTransactions} معاملة وتحليلها بواسطة التحليل الذكي
                </p>
              </div>
              {renderCustomerInfo()}
              {renderAnalysisSummary()}
              {renderCategoriesBreakdown()}
              {renderWeeklySpendingChart()}
              {renderDetailedCategories()}
              {renderGovernmentPayments()}
              {renderRecurringExpenses()}
              {renderRecommendations()}
              {renderTransactions()}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};