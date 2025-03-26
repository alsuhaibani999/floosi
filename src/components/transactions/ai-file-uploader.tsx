import React, { useState } from 'react';
import { Upload, BarChart, LineChart, PieChart, FileText, ChevronLeft, UploadCloud, BookOpen } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

export const AIFileUploader: React.FC = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);


  // استخدام React Query للتعامل مع تحميل الملف ومعالجته
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // إنشاء معرّف فريد للملف
      const fileId = Date.now().toString();
      
      // إنشاء كائن الملف المحمّل
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 25,
        status: 'uploading'
      };
      
      setUploadedFile(newFile);
      
      // إنشاء FormData لتحميل الملف
      const formData = new FormData();
      formData.append('file', file);
      
      // تحديث حالة التقدم
      setUploadedFile(prev => prev ? {...prev, progress: 50, status: 'analyzing'} : null);
      
      // استدعاء واجهة برمجة التطبيقات لتحميل وتحليل الملف
      const response = await apiRequest(
        'POST', 
        '/api/upload-statement-enhanced', 
        formData,
        { isFormData: true }
      );
      
      // تحديث حالة التقدم إلى "مكتمل"
      setUploadedFile(prev => prev ? {...prev, progress: 100, status: 'completed'} : null);
      
      // إرجاع البيانات المحللة
      return response;
    },
    onSuccess: (data) => {
      // تخزين نتيجة التحليل
      setAnalysisData(data);
      
      toast({
        title: 'تم تحليل الملف بنجاح',
        description: `تم استخراج ${data.totalTransactions || 0} معاملة من الملف`,
      });
    },
    onError: (error: Error) => {
      // تحديث حالة الملف إلى "خطأ"
      setUploadedFile(prev => prev ? {...prev, status: 'error', error: error.message} : null);
      
      toast({
        title: 'حدث خطأ أثناء تحليل الملف',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // التعامل مع حدث تحميل الملف
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files[0]);
    }
  };

  // حساب حجم الملف بصيغة مقروءة
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // عرض حالة تحميل الملف
  const renderUploadStatus = () => {
    if (!uploadedFile) return null;

    let statusIcon;
    let statusText;
    let statusColor;

    switch (uploadedFile.status) {
      case 'uploading':
        statusIcon = <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>;
        statusText = 'جاري تحميل الملف...';
        statusColor = 'bg-blue-50 border-blue-200';
        break;
      case 'analyzing':
        statusIcon = <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>;
        statusText = 'جاري تحليل المعاملات...';
        statusColor = 'bg-purple-50 border-purple-200';
        break;
      case 'completed':
        statusIcon = <div className="h-4 w-4 rounded-full bg-green-500"></div>;
        statusText = 'تم التحليل بنجاح';
        statusColor = 'bg-green-50 border-green-200';
        break;
      case 'error':
        statusIcon = <div className="h-4 w-4 rounded-full bg-red-500"></div>;
        statusText = `خطأ: ${uploadedFile.error || 'فشل في تحميل أو تحليل الملف'}`;
        statusColor = 'bg-red-50 border-red-200';
        break;
    }

    return (
      <div className={`mt-4 p-3 rounded-md border ${statusColor} flex items-center`}>
        <div className="mr-2">{statusIcon}</div>
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="text-sm font-medium">{uploadedFile.name}</span>
            <span className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</span>
          </div>
          <div className="text-xs mt-1">{statusText}</div>
        </div>
      </div>
    );
  };

  // عرض الشاشة الرئيسية للداشبورد مع رسالة ترحيبية
  const renderUploadScreen = () => (
    <div className="text-center py-8">
      <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <UploadCloud className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">ابدأ بتحميل كشف حسابك البنكي</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        حلل مصاريفك وإيراداتك تلقائياً باستخدام الذكاء الاصطناعي واكتشف نمط الإنفاق الخاص بك
      </p>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link to="/transactions?tab=saudi-banks">
            <Upload className="h-4 w-4 mr-2" />
            استيراد كشف حساب
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/investment">
            <BookOpen className="h-4 w-4 mr-2" />
            القواعد المالية
          </Link>
        </Button>
      </div>
    </div>
  );

  // عرض الرسوم البيانية في حالة وجود بيانات تحليلية
  const renderAnalyticsCharts = () => {
    // في حالة عدم وجود بيانات تحليلية، نعرض شاشة تحميل الملف
    if (!analysisData) {
      return renderUploadScreen();
    }

    const { 
      analysis,
      transactions,
      totalTransactions,
      customerInfo
    } = analysisData;

    if (!analysis || !transactions || transactions.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">لم يتم العثور على بيانات كافية للتحليل في الملف المحمل</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setAnalysisData(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              العودة وتحميل ملف آخر
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // حساب النسب المالية من البيانات المستخرجة
    const calculateFinancialRatios = () => {
      // حساب نسبة المدخرات
      const savingsRate = analysis.savingsRate ? analysis.savingsRate : 
        (analysis.totalDeposits > 0 ? 
          ((analysis.totalDeposits - analysis.totalWithdrawals) / analysis.totalDeposits * 100).toFixed(1) : 0);
      
      // تقدير تكاليف السكن (نفترض أنها 25-30% من المصروفات الثابتة)
      const housingCost = analysis.categories.find((c: any) => 
        c.name === 'سكن' || c.name === 'إيجار' || c.name === 'عقار');
      const housingRate = housingCost ? 
        ((housingCost.amount / analysis.totalDeposits) * 100).toFixed(1) : 'غير متوفر';
      
      // حساب نسبة الديون
      const debtPayments = analysis.categories.find((c: any) => 
        c.name === 'أقساط' || c.name === 'قروض' || c.name === 'تمويل');
      const debtRate = debtPayments ? 
        ((debtPayments.amount / analysis.totalDeposits) * 100).toFixed(1) : 'غير متوفر';
      
      // حساب مؤشر 50/30/20
      const necessities = analysis.categories
        .filter((c: any) => ['سكن', 'طعام', 'صحة', 'نقل', 'تعليم', 'فواتير'].includes(c.name))
        .reduce((sum: number, cat: any) => sum + cat.amount, 0);
      
      const necessitiesRate = ((necessities / analysis.totalWithdrawals) * 100).toFixed(1);
      
      const luxuries = analysis.categories
        .filter((c: any) => ['ترفيه', 'مطاعم', 'تسوق', 'سفر'].includes(c.name))
        .reduce((sum: number, cat: any) => sum + cat.amount, 0);
      
      const luxuriesRate = ((luxuries / analysis.totalWithdrawals) * 100).toFixed(1);
      
      // حساب المصروفات الشهرية المتوسطة
      const dateCount = analysis.dateRange?.uniqueDatesCount ? Number(analysis.dateRange.uniqueDatesCount) : 30;
      const monthlyExpenseAvg = analysis.totalWithdrawals / 
        (dateCount > 30 ? dateCount / 30 : 1);
      
      // عدد أشهر الكفاية المالية (نفترض أن المدخرات هي صافي التدفق الإيجابي)
      const financialIndependenceMonths = analysis.cashFlow > 0 ? 
        (analysis.cashFlow / monthlyExpenseAvg).toFixed(1) : 0;
      
      // حساب مؤشر مصروفات الرفاهية
      const luxuryExpenseRate = ((luxuries / analysis.totalDeposits) * 100).toFixed(1);
      
      return {
        savingsRate,
        housingRate,
        debtRate,
        necessitiesRate,
        luxuriesRate,
        financialIndependenceMonths,
        luxuryExpenseRate
      };
    };
    
    // الحصول على النسب المالية
    const financialRatios = calculateFinancialRatios();

      // المعاملات المستخرجة للعرض
    const extractedTransactions = transactions ? 
      transactions.slice(0, Math.min(transactions.length, 30)) : [];

    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle>التحليل المالي الذكي</CardTitle>
            <CardDescription>
              تم تحليل {totalTransactions} معاملة من كشف الحساب
              {customerInfo?.name ? ` للعميل: ${customerInfo.name}` : ''}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">ملخص التحليل المالي</h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAnalysisData(null)}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    تحميل ملف آخر
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-blue-700">صافي التدفق</p>
                      <p className="text-2xl font-bold text-blue-900">{analysis.cashFlow.toLocaleString()} ر.س</p>
                    </div>
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <BarChart className="text-blue-500 h-5 w-5" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-green-700">إجمالي الإيرادات</p>
                      <p className="text-2xl font-bold text-green-900">{analysis.totalDeposits.toLocaleString()} ر.س</p>
                    </div>
                    <div className="bg-green-500/10 p-2 rounded-full">
                      <LineChart className="text-green-500 h-5 w-5" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-red-700">إجمالي المصروفات</p>
                      <p className="text-2xl font-bold text-red-900">{analysis.totalWithdrawals.toLocaleString()} ر.س</p>
                    </div>
                    <div className="bg-red-500/10 p-2 rounded-full">
                      <PieChart className="text-red-500 h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">الرسم البياني للتدفق المالي</h3>
                <Card className="border">
                  <CardContent className="pt-6">
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
                        {analysis.dateRange?.uniqueDatesCount ? String(analysis.dateRange.uniqueDatesCount) : '30'} يوم
                      </div>
                    </div>
                    
                    <div className="h-[350px]">
                      {transactions.length > 0 ? (
                        <div className="flex flex-col h-full">
                          <div className="flex-1 flex">
                            {/* مقياس القيم */}
                            <div className="w-20 flex flex-col justify-between text-xs text-muted-foreground">
                              <div>{analysis.totalDeposits.toLocaleString()} ر.س</div>
                              <div>{(analysis.totalDeposits / 2).toLocaleString()} ر.س</div>
                              <div>0 ر.س</div>
                              <div>{(-analysis.totalWithdrawals / 2).toLocaleString()} ر.س</div>
                              <div>{(-analysis.totalWithdrawals).toLocaleString()} ر.س</div>
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
                                style={{ gridTemplateColumns: `repeat(${Math.min(6, 10)}, 1fr)` }}>
                                {Array.from({ length: Math.min(6, 10) }).map((_, i) => (
                                  <div key={i} className="border-r border-gray-200"></div>
                                ))}
                              </div>
                              
                              {/* خط الصفر */}
                              <div className="absolute top-1/2 left-0 w-full border-t-2 border-gray-300"></div>

                              {/* ولكن هنا سنعرض رسالة عندما تكون البيانات موجودة لأن الرسم البياني سيعتمد على البيانات الحقيقية */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground">
                                  الرسم البياني سيظهر هنا بناءً على البيانات المستخرجة من كشف الحساب
                                </p>
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
              </div>
              
              {/* نتائج المعادلات المالية */}
              <div>
                <h3 className="text-lg font-semibold mb-4">نتائج المعادلات المالية</h3>
                <Card className="border">
                  <CardContent className="p-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 rounded-lg border bg-card shadow-sm">
                        <h3 className="font-semibold mb-2">نسبة المدخرات</h3>
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">النتيجة</span>
                            <span className="text-xl font-bold">{financialRatios.savingsRate}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                            <div
                              className={`h-full rounded-full ${parseFloat(financialRatios.savingsRate) >= 20 ? 'bg-green-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(parseFloat(financialRatios.savingsRate) * 5, 100)}%` }}
                            />
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              {parseFloat(financialRatios.savingsRate) >= 20 ? 'ممتاز! النسبة مثالية' : 'يفضل زيادة نسبة الادخار إلى 20% أو أكثر'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card shadow-sm">
                        <h3 className="font-semibold mb-2">نسبة تكاليف السكن</h3>
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">النتيجة</span>
                            <span className="text-xl font-bold">{financialRatios.housingRate === 'غير متوفر' ? 'غير متوفر' : `${financialRatios.housingRate}%`}</span>
                          </div>
                          {financialRatios.housingRate !== 'غير متوفر' && (
                            <>
                              <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                                <div
                                  className={`h-full rounded-full ${parseFloat(financialRatios.housingRate) <= 30 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(parseFloat(financialRatios.housingRate) * 3.3, 100)}%` }}
                                />
                              </div>
                              <div className="text-center mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {parseFloat(financialRatios.housingRate) <= 30 ? 'ضمن النطاق المثالي' : 'النسبة مرتفعة'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card shadow-sm">
                        <h3 className="font-semibold mb-2">نسبة مدفوعات الديون</h3>
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">النتيجة</span>
                            <span className="text-xl font-bold">{financialRatios.debtRate === 'غير متوفر' ? 'غير متوفر' : `${financialRatios.debtRate}%`}</span>
                          </div>
                          {financialRatios.debtRate !== 'غير متوفر' && (
                            <>
                              <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                                <div
                                  className={`h-full rounded-full ${parseFloat(financialRatios.debtRate) <= 36 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(parseFloat(financialRatios.debtRate) * 2.8, 100)}%` }}
                                />
                              </div>
                              <div className="text-center mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {parseFloat(financialRatios.debtRate) <= 36 ? 'نسبة مقبولة من الدخل' : 'النسبة مرتفعة'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card shadow-sm">
                        <h3 className="font-semibold mb-2">توزيع 50/30/20</h3>
                        <div className="mb-3">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground block mb-1">الضروريات</span>
                              <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${Math.min(parseFloat(financialRatios.necessitiesRate), 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-muted-foreground">50%</span>
                                <span className="text-xs">{financialRatios.necessitiesRate}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex-1">
                              <span className="text-xs text-muted-foreground block mb-1">الكماليات</span>
                              <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${Math.min(parseFloat(financialRatios.luxuriesRate), 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-muted-foreground">30%</span>
                                <span className="text-xs">{financialRatios.luxuriesRate}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card shadow-sm">
                        <h3 className="font-semibold mb-2">الكفاية المالية</h3>
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">الأشهر</span>
                            <span className="text-xl font-bold">{financialRatios.financialIndependenceMonths}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                            <div
                              className={`h-full rounded-full ${Number(financialRatios.financialIndependenceMonths) >= 3 ? 'bg-green-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(Number(financialRatios.financialIndependenceMonths) * 16.6, 100)}%` }}
                            />
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              {Number(financialRatios.financialIndependenceMonths) >= 3 ? 'مدة كافية في حالة الطوارئ' : 'يفضل زيادة المدخرات لتغطية 3-6 أشهر'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card shadow-sm">
                        <h3 className="font-semibold mb-2">مصروفات الرفاهية</h3>
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">النسبة</span>
                            <span className="text-xl font-bold">{financialRatios.luxuryExpenseRate}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                            <div
                              className={`h-full rounded-full ${parseFloat(financialRatios.luxuryExpenseRate) <= 10 ? 'bg-green-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(parseFloat(financialRatios.luxuryExpenseRate) * 10, 100)}%` }}
                            />
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              {parseFloat(financialRatios.luxuryExpenseRate) <= 10 ? 'نسبة متوازنة من الدخل' : 'تشكل نسبة مرتفعة من الدخل'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              

              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4">تحليل الإنفاق حسب الفئة</h3>
                  <Card className="border h-[300px]">
                    <CardContent className="p-6">
                      {analysis.categories && analysis.categories.length > 0 ? (
                        <div className="space-y-4">
                          {analysis.categories.slice(0, 5).map((category: any, index: number) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">{category.name}</span>
                                <span className="text-sm font-medium">{category.amount.toLocaleString()} ر.س</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${category.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground">لا توجد بيانات كافية لتحليل الفئات</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {analysis.detailedCategories ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">تصنيف المعاملات التفصيلي</h3>
                    <Card className="border h-[300px]">
                      <CardContent className="p-6">
                        {analysis.detailedCategories.dominant && analysis.detailedCategories.dominant.length > 0 ? (
                          <div className="space-y-3">
                            {analysis.detailedCategories.dominant.slice(0, 5).map((cat: any, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg relative overflow-hidden">
                                <div className="relative z-10">
                                  <h4 className="font-semibold">{cat.name}</h4>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-sm text-muted-foreground">{cat.count} معاملة</span>
                                    <span className="font-medium">{cat.amount.toLocaleString()} ر.س</span>
                                  </div>
                                </div>
                                <div 
                                  className="absolute top-0 right-0 h-full bg-primary/10"
                                  style={{ 
                                    width: `${Math.min(100, (cat.amount / (analysis.detailedCategories.dominant[0].amount * 1.2)) * 100)}%`,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">لا توجد بيانات كافية للتصنيف التفصيلي</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </div>
              
              {/* توصيات مالية */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">توصيات مالية</h3>
                  <Card className="border">
                    <CardContent className="p-6">
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2"></div>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="border-t p-4 bg-muted/20">
            <div className="text-xs text-muted-foreground w-full text-center">
              تم تحليل البيانات باستخدام نظام التحليل المالي الذكي | {new Date().toLocaleDateString('ar-SA')}
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // عرض الواجهة المناسبة بناءً على حالة التحليل
  return analysisData ? renderAnalyticsCharts() : renderUploadScreen();
};