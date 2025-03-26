import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, File, CheckCircle, X, Upload, Wallet, Download, FileSearch, BarChart2, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  isExpense: boolean;
}

interface AnalysisResult {
  success: boolean;
  transactions: ExtractedTransaction[];
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  cashFlow?: number;
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
    uniqueDatesCount: number;
  };
  largestTransactions?: {
    deposit: { amount: number; date: string; description: string };
    withdrawal: { amount: number; date: string; description: string };
  };
  categories?: { name: string; amount: number }[];
  recurringExpenses?: {
    amount: number;
    count: number;
    total: number;
    description: string;
  }[];
  monthlyAnalysis?: {
    month: string;
    deposits: number;
    withdrawals: number;
    net: number;
  }[];
  averages?: {
    monthlyIncome: number;
    monthlyExpense: number;
    savingsRate: number;
  };
  recommendations?: string[];
}

export const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileId = Math.random().toString(36).substring(2, 9);
      
      // إضافة الملف إلى قائمة الملفات برفع 0%
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading'
      };
      
      setFiles(prev => [...prev, newFile]);
      
      // إنشاء FormData لرفع الملف
      const formData = new FormData();
      formData.append('file', file);
      
      // رفع الملف والبدء بتحليله - لكن أولاً نحاكي تقدم الرفع
      for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: i * 10 } : f
        ));
      }
      
      // تعيين حالة التحليل
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'analyzing' } : f
      ));
      
      // الاتصال بـ API لتحليل الملف
      const response = await apiRequest(
        'POST', 
        '/api/upload-statement', 
        formData,
        { isFormData: true }
      );
      
      // تعيين حالة الاكتمال
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'completed' } : f
      ));
      
      // حفظ نتائج التحليل
      setAnalysisResult(response as AnalysisResult);
      
      return {
        fileId,
        result: response as AnalysisResult
      };
    },
    onSuccess: (data) => {
      // تحديث التخزين المؤقت للمعاملات إذا لزم الأمر
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      const result = data.result;
      toast({
        title: "تم رفع الملف بنجاح",
        description: `تم تحليل كشف الحساب واستخراج ${result.totalTransactions} معاملة`,
      });
      
      // عرض نتائج التحليل
      setShowResultsDialog(true);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في رفع الملف",
        description: error.message,
        variant: "destructive",
      });
      
      // تحديث حالة الملف إلى خطأ
      if (files.length > 0) {
        setFiles(prev => prev.map(f => 
          f.status === 'analyzing' ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (filesList: File[]) => {
    // فلترة الملفات المقبولة (PDF، Excel، Word)
    const acceptedTypes = [
      'application/pdf', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    for (const file of filesList) {
      if (acceptedTypes.includes(file.type)) {
        uploadMutation.mutate(file);
      } else {
        toast({
          title: "نوع ملف غير مدعوم",
          description: `الملف ${file.name} ليس من الأنواع المدعومة (PDF، Excel، Word)`,
          variant: "destructive",
        });
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (type.includes('excel') || type.includes('sheet')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
    } else {
      return <File className="h-6 w-6 text-blue-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // عرض نتائج التحليل
  const showAnalysisResults = () => {
    if (analysisResult) {
      setShowResultsDialog(true);
    }
  };
  
  // استيراد المعاملات إلى النظام
  const importTransactions = () => {
    if (analysisResult) {
      toast({
        title: "تم استيراد المعاملات",
        description: `تم استيراد ${analysisResult.totalTransactions} معاملة بنجاح`,
      });
      
      // تحديث التخزين المؤقت للمعاملات
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      // إعادة توجيه المستخدم إلى صفحة المعاملات (يمكن أن يتم عبر الكود)
    }
  };
  
  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50 hover:bg-primary/5'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf,.xls,.xlsx,.doc,.docx" 
          onChange={handleFileChange}
          multiple
        />
        
        <Upload className="h-12 w-12 mx-auto mb-4 text-primary/70" />
        
        <div className="text-sm">
          <p className="font-medium mb-1">قم بسحب وإفلات ملفات كشف الحساب هنا</p>
          <p className="text-gray-500">أو انقر لاختيار الملفات (PDF، Excel، Word)</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-3 mt-4">
          <h3 className="text-sm font-medium">الملفات التي تم رفعها:</h3>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  {getFileIcon(file.type)}
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      
                      {file.status === 'uploading' && (
                        <span className="mr-2 flex items-center">
                          <Progress value={file.progress} className="w-24 h-2 ml-2" />
                          <span className="ml-1">جاري الرفع...</span>
                          {file.progress}%
                        </span>
                      )}
                      
                      {file.status === 'analyzing' && (
                        <span className="mr-2 flex items-center">
                          <FileSearch className="w-3 h-3 ml-1 animate-pulse" />
                          <span className="animate-pulse">جاري تحليل الملف...</span>
                        </span>
                      )}
                      
                      {file.status === 'completed' && (
                        <span className="mr-2 flex items-center text-green-600">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          <span>تم تحليل الملف</span>
                          
                          <Button 
                            variant="link" 
                            className="text-xs p-0 h-auto ml-2 text-primary" 
                            onClick={(e) => {
                              e.stopPropagation();
                              showAnalysisResults();
                            }}
                          >
                            <FileSearch className="w-3 h-3 ml-1 inline" />
                            عرض النتائج
                          </Button>
                        </span>
                      )}
                      
                      {file.status === 'error' && (
                        <span className="mr-2 flex items-center text-red-600">
                          <AlertCircle className="w-3 h-3 ml-1" />
                          {file.error || 'حدث خطأ أثناء المعالجة'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {files.length > 0 && files.some(f => f.status === 'completed') && (
        <div className="mt-6 flex flex-col gap-2">
          <Button 
            className="w-full"
            variant="outline"
            onClick={showAnalysisResults}
            disabled={!analysisResult}
          >
            <FileSearch className="h-4 w-4 ml-2" />
            عرض نتائج التحليل
          </Button>
          
          <Button 
            className="w-full"
            onClick={importTransactions}
            disabled={!analysisResult}
          >
            <Wallet className="h-4 w-4 ml-2" />
            استيراد المعاملات ({analysisResult?.totalTransactions || 0})
          </Button>
        </div>
      )}
      
      {/* مربع حوار عرض نتائج التحليل */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>نتائج تحليل كشف الحساب</DialogTitle>
            <DialogDescription>
              تم العثور على {analysisResult?.totalTransactions || 0} معاملة في كشف الحساب
            </DialogDescription>
          </DialogHeader>
          
          {analysisResult && (
            <div className="space-y-6">
              {/* البطاقات الملخصة */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="group hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-green-600">
                      {formatCurrency(analysisResult.totalDeposits || 0)}
                    </CardTitle>
                    <CardDescription>إجمالي الإيداعات</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="group hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-red-600">
                      {formatCurrency(analysisResult.totalWithdrawals || 0)}
                    </CardTitle>
                    <CardDescription>إجمالي المصروفات</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className={`group hover:shadow-md transition-all duration-200 ${(analysisResult.cashFlow || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-xl ${(analysisResult.cashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(analysisResult.cashFlow || 0)}
                    </CardTitle>
                    <CardDescription>صافي التدفق النقدي</CardDescription>
                  </CardHeader>
                </Card>
              </div>
              
              {/* القسم الثاني - التحليل المالي المتقدم */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* تحليل الفئات */}
                {analysisResult.categories && analysisResult.categories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">تحليل فئات المصروفات</CardTitle>
                      <CardDescription>توزيع المصروفات حسب الفئة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysisResult.categories.map((category, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm rtl-text category-name">{category.name}</span>
                              <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
                            </div>
                            <Progress 
                              value={(category.amount / (analysisResult.totalWithdrawals || 1)) * 100} 
                              className={`h-2 ${index % 2 === 0 ? 'bg-primary/20' : 'bg-secondary/20'}`}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* المصروفات المتكررة */}
                {analysisResult.recurringExpenses && analysisResult.recurringExpenses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">المصروفات المتكررة</CardTitle>
                      <CardDescription>المدفوعات التي تتكرر بشكل منتظم</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.recurringExpenses.map((expense, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                            <div>
                              <div className="font-medium text-sm">{formatCurrency(expense.amount)}</div>
                              <div className="text-xs text-gray-500 max-w-[200px] truncate" title={expense.description} style={{ direction: 'rtl', textAlign: 'right', unicodeBidi: 'embed' }}>
                                {expense.description}
                              </div>
                            </div>
                            <Badge variant="outline">
                              {expense.count}× متكرر
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* المعدلات والتوصيات */}
              {analysisResult.averages && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تحليل المعدلات الشهرية والتوصيات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 border rounded-md">
                        <div className="text-sm text-gray-500">متوسط الدخل الشهري</div>
                        <div className="text-xl font-semibold text-green-600">
                          {formatCurrency(analysisResult.averages.monthlyIncome)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm text-gray-500">متوسط الإنفاق الشهري</div>
                        <div className="text-xl font-semibold text-red-600">
                          {formatCurrency(analysisResult.averages.monthlyExpense)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm text-gray-500">معدل الادخار</div>
                        <div className="text-xl font-semibold">
                          {analysisResult.averages.savingsRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* التوصيات المالية */}
                    {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">التوصيات المالية:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysisResult.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-gray-700">{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* أكبر المعاملات */}
              {analysisResult.largestTransactions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">
                        أكبر إيداع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 border rounded-md">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(analysisResult.largestTransactions.deposit.amount)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {analysisResult.largestTransactions.deposit.date}
                        </div>
                        <div className="text-sm mt-2 truncate rtl-text transaction-description" title={analysisResult.largestTransactions.deposit.description}>
                          {analysisResult.largestTransactions.deposit.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">
                        أكبر مصروف
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 border rounded-md">
                        <div className="text-xl font-bold text-red-600">
                          {formatCurrency(analysisResult.largestTransactions.withdrawal.amount)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {analysisResult.largestTransactions.withdrawal.date}
                        </div>
                        <div className="text-sm mt-2 truncate rtl-text transaction-description" title={analysisResult.largestTransactions.withdrawal.description}>
                          {analysisResult.largestTransactions.withdrawal.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* الفترة الزمنية */}
              {analysisResult.dateRange && (
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">معلومات كشف الحساب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-gray-500">من تاريخ</div>
                        <div className="font-medium">{analysisResult.dateRange.startDate ? String(analysisResult.dateRange.startDate) : 'غير متوفر'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">إلى تاريخ</div>
                        <div className="font-medium">{analysisResult.dateRange.endDate ? String(analysisResult.dateRange.endDate) : 'غير متوفر'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">عدد أيام المعاملات</div>
                        <div className="font-medium">{String(analysisResult.dateRange.uniqueDatesCount)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* جدول المعاملات */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">قائمة المعاملات المالية</CardTitle>
                  <CardDescription>
                    تم استخراج {analysisResult.totalTransactions} معاملة من الكشف
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-96 border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">التاريخ</TableHead>
                          <TableHead>الوصف</TableHead>
                          <TableHead className="w-[120px]">المبلغ</TableHead>
                          <TableHead className="w-[100px]">النوع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analysisResult.transactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell 
                              className="max-w-xs truncate rtl-text transaction-description" 
                              title={transaction.description}
                            >
                              {transaction.description}
                            </TableCell>
                            <TableCell className={transaction.isExpense ? "text-red-600" : "text-green-600"}>
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.isExpense ? "destructive" : "secondary"} 
                                className={transaction.isExpense ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}>
                                {transaction.isExpense ? 'مصروف' : 'إيداع'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowResultsDialog(false)}>
              إغلاق
            </Button>
            <Button onClick={importTransactions}>
              <Wallet className="h-4 w-4 ml-2" />
              استيراد المعاملات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};