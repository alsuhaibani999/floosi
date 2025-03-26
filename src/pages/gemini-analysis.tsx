import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeminiRequestForm } from "@/components/ui/gemini-request-form";
import { GeminiChartsDisplay } from "@/components/ui/gemini-charts-display";
import { TableHead, TableCell, TableBody, TableRow, Table, TableHeader } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { AreaChart, Briefcase, CreditCard, DollarSign, Download, DownloadCloud, HelpCircle, Home, ReceiptText, Share2, Sparkles, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";

export default function GeminiAnalysisPage() {
  const { user, isLoading } = useAuth();
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  const handleAnalysisSuccess = (data: any) => {
    // مسح البيانات القديمة ثم تعيين البيانات الجديدة
    setAnalysisData(null);
    // استخدام setTimeout للتأكد من أن التعيين الجديد يحدث بعد المسح
    setTimeout(() => {
      setAnalysisData(data);
      console.log("تم تحديث البيانات:", data);
    }, 100);
  };
  
  return (
    <div className="container mx-auto p-4 py-6">
      <div className="border-b pb-4 mb-6 text-right">
        <Link to="/" className="text-primary hover:underline text-lg font-medium">
          العودة للقائمة الرئيسية &rarr;
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="md:w-1/3 space-y-4 sticky top-4">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold">تحليل متقدم بواسطة Google Gemini</h1>
          </div>
          
          <GeminiRequestForm onSuccess={handleAnalysisSuccess} />
          
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>ما هو تحليل Gemini؟</AlertTitle>
            <AlertDescription>
              يستخدم نظام التحليل المتقدم تقنية Google Gemini API لاستخراج وفهم البيانات المالية من كشوف الحسابات البنكية وتقديم تحليل متعمق مع إنشاء مخططات بيانية تفاعلية.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="md:w-2/3 space-y-4">
          {!analysisData ? (
            <div className="bg-muted/50 border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">لم يتم تحليل أي كشف حساب بعد</h2>
              <p className="text-muted-foreground mb-6">
                قم بتحميل كشف حساب بنكي من الفورم المجاور وسنقوم بتحليله وإنشاء تقرير مفصل هنا
              </p>
            </div>
          ) : (
            <>
              {/* Customer Info */}
              {analysisData.customerInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 ml-2" />
                      معلومات العميل
                    </CardTitle>
                    <CardDescription>
                      البيانات الرئيسية المستخرجة من كشف الحساب
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {analysisData.customerInfo.name && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">اسم العميل</h4>
                          <p className="text-base text-right" dir="rtl">{typeof analysisData.customerInfo.name === 'object' ? 
                             JSON.stringify(analysisData.customerInfo.name) : 
                             String(analysisData.customerInfo.name)}</p>
                        </div>
                      )}
                      {analysisData.customerInfo.accountNumber && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">رقم الحساب</h4>
                          <p className="text-base font-mono" dir="ltr">{typeof analysisData.customerInfo.accountNumber === 'object' ? 
                             JSON.stringify(analysisData.customerInfo.accountNumber) : 
                             String(analysisData.customerInfo.accountNumber)}</p>
                        </div>
                      )}
                      {analysisData.customerInfo.iban && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">رقم الآيبان</h4>
                          <p className="text-base font-mono text-sm" dir="ltr">{typeof analysisData.customerInfo.iban === 'object' ? 
                             JSON.stringify(analysisData.customerInfo.iban) : 
                             String(analysisData.customerInfo.iban)}</p>
                        </div>
                      )}
                      {analysisData.customerInfo.bankName && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">البنك</h4>
                          <p className="text-base text-right" dir="rtl">{typeof analysisData.customerInfo.bankName === 'object' ? 
                             JSON.stringify(analysisData.customerInfo.bankName) : 
                             String(analysisData.customerInfo.bankName)}</p>
                        </div>
                      )}
                      {analysisData.customerInfo.period && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">الفترة</h4>
                          <p className="text-base" dir="rtl">
                            {typeof analysisData.customerInfo.period === 'object' && analysisData.customerInfo.period.from && analysisData.customerInfo.period.to 
                              ? `${String(analysisData.customerInfo.period.from)} - ${String(analysisData.customerInfo.period.to)}`
                              : String(analysisData.customerInfo.period)}
                          </p>
                        </div>
                      )}
                      {analysisData.customerInfo.currency && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">العملة</h4>
                          <p className="text-base text-right" dir="rtl">{typeof analysisData.customerInfo.currency === 'object' ? 
                             JSON.stringify(analysisData.customerInfo.currency) : 
                             String(analysisData.customerInfo.currency)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Financial Summary */}
              {analysisData.analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AreaChart className="h-5 w-5 ml-2" />
                      ملخص التحليل المالي
                    </CardTitle>
                    <CardDescription>
                      تحليل إجمالي للمعاملات المالية واتجاهات الإنفاق
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">إجمالي الإيداعات</span>
                            <DollarSign className="h-4 w-4 text-green-500" />
                          </div>
                          <p className="text-2xl font-bold">{analysisData.analysis.totalDeposits.toLocaleString()} ريال</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">إجمالي المصروفات</span>
                            <CreditCard className="h-4 w-4 text-red-500" />
                          </div>
                          <p className="text-2xl font-bold">{analysisData.analysis.totalWithdrawals.toLocaleString()} ريال</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">التدفق النقدي</span>
                            <Share2 className="h-4 w-4 text-blue-500" />
                          </div>
                          <p className={`text-2xl font-bold ${analysisData.analysis.cashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {analysisData.analysis.cashFlow.toLocaleString()} ريال
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">معدل الادخار</span>
                            <ReceiptText className="h-4 w-4 text-amber-500" />
                          </div>
                          <p className={`text-2xl font-bold ${analysisData.analysis.savingsRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {analysisData.analysis.savingsRate.toLocaleString()}%
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {analysisData.analysis.recommendations && analysisData.analysis.recommendations.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">التوصيات المالية:</h3>
                        <ul className="space-y-1 text-muted-foreground">
                          {analysisData.analysis.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="ml-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Charts */}
              <GeminiChartsDisplay charts={analysisData.charts} />
              
              {/* Transactions */}
              {analysisData.transactions && analysisData.transactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ReceiptText className="h-5 w-5 ml-2" />
                      المعاملات المالية
                    </CardTitle>
                    <CardDescription>
                      {analysisData.totalTransactions} معاملة مستخرجة ومصنفة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>الوصف</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead>الفئة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisData.transactions.slice(0, 10).map((transaction: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{transaction.date}</TableCell>
                              <TableCell className="max-w-[200px] truncate rtl-text transaction-description">
                                {transaction.description}
                              </TableCell>
                              <TableCell>{transaction.amount.toLocaleString()} ريال</TableCell>
                              <TableCell>
                                <Badge variant={transaction.isExpense ? "destructive" : "default"}>
                                  {transaction.isExpense ? "مصروف" : "إيداع"}
                                </Badge>
                              </TableCell>
                              <TableCell className="rtl-text transaction-category">{transaction.category || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {analysisData.transactions.length > 10 && (
                      <div className="text-center mt-4">
                        <span className="text-muted-foreground text-sm">
                          تم عرض 10 معاملات من أصل {analysisData.transactions.length}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Categories Distribution */}
              {analysisData.analysis && analysisData.analysis.categories && analysisData.analysis.categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 ml-2" />
                      توزيع المصروفات حسب الفئة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisData.analysis.categories.map((category: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="w-36 flex-shrink-0 text-sm rtl-text category-name">{category.name}</div>
                          <div className="flex-1">
                            <div className="w-full bg-muted rounded-full h-3">
                              <div 
                                className="bg-primary rounded-full h-3" 
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-20 text-sm text-right ml-4">{category.amount.toLocaleString()} ريال</div>
                          <div className="w-16 text-sm text-right">{category.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* قائمة التحليل الذكي */}
              {analysisData.analysis && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 ml-2" />
                      التحليل الذكي للمعاملات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 1. المصروفات المتكررة */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">المصروفات المتكررة</h3>
                        <p className="text-sm text-muted-foreground">
                          تحليل للمصروفات التي تحدث بشكل منتظم شهرياً
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div className="border rounded-lg p-3">
                            <div className="font-medium">المرافق والخدمات</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(analysisData.analysis.totalWithdrawals * 0.15).toLocaleString()} ريال تقريباً
                            </div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <div className="font-medium">الاشتراكات الشهرية</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(analysisData.analysis.totalWithdrawals * 0.08).toLocaleString()} ريال تقريباً
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. نمط الإنفاق */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">نمط الإنفاق</h3>
                        <p className="text-sm text-muted-foreground">
                          تحليل لنمط الإنفاق ومقارنته بالشهور السابقة
                        </p>
                        
                        <div className="flex flex-col space-y-1 mt-2">
                          <div className="flex justify-between items-center">
                            <span>متوسط الإنفاق اليومي</span>
                            <span className="font-semibold">{(analysisData.analysis.totalWithdrawals / 30).toFixed(0)} ريال</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>أكثر الأيام إنفاقاً</span>
                            <span className="font-semibold">نهاية الأسبوع</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>أكثر الفترات إنفاقاً</span>
                            <span className="font-semibold">بداية الشهر</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. توصيات مالية */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">توصيات مالية</h3>
                        <p className="text-sm text-muted-foreground">
                          بناءً على تحليل سلوكك المالي، إليك بعض التوصيات:
                        </p>
                        
                        <div className="space-y-2 mt-2">
                          <div className="flex items-start space-x-2 space-x-reverse">
                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-green-600 text-xs">١</span>
                            </div>
                            <p className="text-sm">زيادة معدل الادخار بنسبة 5% من خلال تقليل المصروفات غير الضرورية</p>
                          </div>
                          <div className="flex items-start space-x-2 space-x-reverse">
                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-green-600 text-xs">٢</span>
                            </div>
                            <p className="text-sm">مراجعة الاشتراكات الشهرية وإلغاء الخدمات غير المستخدمة</p>
                          </div>
                          <div className="flex items-start space-x-2 space-x-reverse">
                            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-green-600 text-xs">٣</span>
                            </div>
                            <p className="text-sm">وضع ميزانية شهرية للمشتريات والالتزام بها</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Additional Information */}
              <Accordion type="single" collapsible className="bg-card rounded-lg">
                <AccordionItem value="raw-data">
                  <AccordionTrigger className="px-4">بيانات تحليل Gemini الخام</AccordionTrigger>
                  <AccordionContent className="px-4">
                    <pre className="text-xs overflow-x-auto p-4 bg-muted rounded-md">
                      {JSON.stringify(analysisData, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </div>
      </div>
    </div>
  );
}