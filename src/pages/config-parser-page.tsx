import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfigBasedUploader from "../components/transactions/config-based-uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDown,
  ArrowUp,
  Activity,
  PiggyBank,
  CreditCard,
  Calendar,
  User,
  Building,
  Hash,
  Clock,
  CreditCard as CardIcon,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

// نظام الألوان للرسوم البيانية
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6BCB77", "#4D96FF", "#5E17EB"];

export default function ConfigParserPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleUploadSuccess = (data: any) => {
    console.log("تم استلام نتائج التحليل:", data);
    setAnalysisResult(data);
  };

  // حساب نسبة التصنيفات للدائرة البيانية
  const prepareCategoryData = (categories: any[]) => {
    if (!categories || categories.length === 0) return [];
    
    return categories
      .filter(cat => cat.amount > 0)
      .map(cat => ({
        name: cat.name,
        value: cat.amount,
        percentage: cat.percentage
      }));
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-right mb-6">محلل كشوف الحسابات</h1>
      <p className="text-muted-foreground text-right mb-8">
        قم بتحميل كشف حسابك البنكي وسنقوم بتحليله وتصنيف معاملاتك تلقائيًا
      </p>

      <div className="grid grid-cols-1 gap-8">
        {!analysisResult && (
          <div className="mb-6">
            <ConfigBasedUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {analysisResult && (
          <>
            <div className="flex justify-between items-center flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => setAnalysisResult(null)}
                className="mb-4"
              >
                تحميل ملف آخر
              </Button>
              
              <div className="flex flex-col items-end mb-4">
                <h2 className="text-2xl font-bold">
                  {analysisResult.customerInfo?.name || "عميل البنك"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {analysisResult.bankName || analysisResult.customerInfo?.bankName || "كشف حساب بنكي"}
                </p>
              </div>
            </div>

            <Tabs defaultValue="overview" dir="rtl" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="transactions">المعاملات ({analysisResult.totalTransactions || 0})</TabsTrigger>
                <TabsTrigger value="insights">تحليلات ورؤى</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* معلومات العميل */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">معلومات العميل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">الاسم</span>
                        </div>
                        <span className="font-medium text-right">
                          {analysisResult.customerInfo?.name || "غير متوفر"}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">البنك</span>
                        </div>
                        <span className="font-medium text-right">
                          {analysisResult.bankName || analysisResult.customerInfo?.bankName || "غير متوفر"}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">رقم الحساب</span>
                        </div>
                        <span className="font-medium text-right dir-ltr">
                          {analysisResult.customerInfo?.accountNumber || "غير متوفر"}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">IBAN</span>
                        </div>
                        <span className="font-medium text-right dir-ltr">
                          {analysisResult.customerInfo?.iban || "غير متوفر"}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">الفترة</span>
                        </div>
                        <span className="font-medium text-right">
                          {analysisResult.customerInfo?.period || "غير متوفر"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ملخص المعاملات */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">ملخص المعاملات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                          <ArrowDown className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground text-right">إجمالي الإيداعات</p>
                          <p className="text-2xl font-bold text-right">
                            {(() => {
                              const amount = analysisResult.analysis?.totalDeposits || 0;
                              // حل المشكلة: إذا كان الرقم كبيرًا جدًا (أكبر من المليار)
                              if (amount > 1000000000) {
                                // تقريب الرقم للقراءة البشرية
                                return new Intl.NumberFormat('ar-SA', {
                                  style: 'currency',
                                  currency: 'SAR',
                                  maximumFractionDigits: 2
                                }).format(amount / 1000000) + " مليون";
                              }
                              return formatCurrency(amount);
                            })()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                          <ArrowUp className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground text-right">إجمالي المصروفات</p>
                          <p className="text-2xl font-bold text-right">
                            {(() => {
                              const amount = analysisResult.analysis?.totalWithdrawals || 0;
                              // حل المشكلة: إذا كان الرقم كبيرًا جدًا (أكبر من المليار)
                              if (amount > 1000000000) {
                                // تقريب الرقم للقراءة البشرية
                                return new Intl.NumberFormat('ar-SA', {
                                  style: 'currency',
                                  currency: 'SAR',
                                  maximumFractionDigits: 2
                                }).format(amount / 1000000) + " مليون";
                              }
                              return formatCurrency(amount);
                            })()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                          <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground text-right">صافي التدفق النقدي</p>
                          <p className="text-2xl font-bold text-right">
                            {(() => {
                              const amount = analysisResult.analysis?.cashFlow || 0;
                              // حل المشكلة: إذا كان الرقم كبيرًا جدًا (أكبر من المليار)
                              if (Math.abs(amount) > 1000000000) {
                                // تقريب الرقم للقراءة البشرية
                                return new Intl.NumberFormat('ar-SA', {
                                  style: 'currency',
                                  currency: 'SAR',
                                  maximumFractionDigits: 2
                                }).format(amount / 1000000) + " مليون";
                              }
                              return formatCurrency(amount);
                            })()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* معلومات الاتجاهات */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">مؤشرات مالية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
                          <PiggyBank className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground text-right">معدل الادخار</p>
                          <p className="text-2xl font-bold text-right">
                            {(analysisResult.analysis?.savingsRate || 0).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
                          <Calendar className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground text-right">فترة التحليل</p>
                          <p className="text-lg font-bold text-right">
                            {analysisResult.analysis?.dateRange?.startDate ? String(analysisResult.analysis.dateRange.startDate) : "؟"} - {analysisResult.analysis?.dateRange?.endDate ? String(analysisResult.analysis.dateRange.endDate) : "؟"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-full">
                          <CreditCard className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground text-right">عدد المعاملات</p>
                          <p className="text-2xl font-bold text-right">
                            {analysisResult.totalTransactions || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* الرسوم البيانية */}
                <div className="grid grid-cols-1 gap-8 mb-8">
                  {/* توزيع المصروفات حسب الفئة */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">توزيع المصروفات حسب الفئة</CardTitle>
                      <CardDescription className="text-right">
                        النسبة المئوية للإنفاق في كل فئة
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysisResult.analysis?.categories && analysisResult.analysis.categories.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={prepareCategoryData(analysisResult.analysis.categories)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({name, percentage}) => `${name}: ${percentage?.toFixed(1)}%`}
                              >
                                {analysisResult.analysis.categories.map((_: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] p-4 text-muted-foreground">
                          <FileText className="h-12 w-12 mb-2 opacity-20" />
                          <p>لا توجد بيانات كافية لعرض توزيع المصروفات</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* التوصيات */}
                {analysisResult.analysis?.recommendations && analysisResult.analysis.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">توصيات مالية</CardTitle>
                      <CardDescription className="text-right">
                        بناءً على تحليل معاملاتك المالية
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-right">
                        {analysisResult.analysis.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="min-w-[20px] mt-1">
                              <div className="bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center">
                                <span className="text-xs text-primary">{index + 1}</span>
                              </div>
                            </div>
                            <p>{recommendation}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-right">المعاملات</CardTitle>
                    <CardDescription className="text-right">
                      قائمة بجميع المعاملات المستخرجة من كشف الحساب ({analysisResult.totalTransactions || 0} معاملة)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.transactions && analysisResult.transactions.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="grid grid-cols-5 bg-muted p-2 font-medium text-right">
                          <div className="col-span-2">الوصف</div>
                          <div className="text-center">التاريخ</div>
                          <div className="text-center">الفئة</div>
                          <div className="text-left">المبلغ</div>
                        </div>
                        <div className="divide-y overflow-x-auto max-h-[500px]">
                          {analysisResult.transactions.map((transaction: any, index: number) => (
                            <div key={index} className="grid grid-cols-5 p-2 text-sm text-right hover:bg-muted/50">
                              <div className="col-span-2 truncate" title={transaction.description}>
                                {transaction.description}
                              </div>
                              <div className="text-center">{transaction.date}</div>
                              <div className="text-center">
                                {transaction.category ? (
                                  <Badge variant={transaction.isExpense ? "destructive" : "default"} className="whitespace-nowrap">
                                    {transaction.category}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                              <div className={`text-left ${transaction.isExpense ? 'text-red-600' : 'text-green-600'}`}>
                                {transaction.isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                        <p className="mb-2 text-center">لم يتم العثور على معاملات في كشف الحساب</p>
                        <p className="text-sm text-center">قد يكون الملف غير مدعوم أو محمي بكلمة مرور</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <div className="grid grid-cols-1 gap-8">
                  {/* أكبر المعاملات */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">أكبر المعاملات</CardTitle>
                      <CardDescription className="text-right">
                        أكبر معاملات الإيداع والسحب في الفترة المحددة
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {analysisResult.analysis?.largestTransactions ? (
                        <>
                          {analysisResult.analysis.largestTransactions.deposit && (
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <ArrowDown className="h-5 w-5 text-green-600" />
                                <h3 className="font-medium">أكبر إيداع</h3>
                              </div>
                              <p className="text-2xl font-bold mb-1">
                                {formatCurrency(analysisResult.analysis.largestTransactions.deposit.amount || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {analysisResult.analysis.largestTransactions.deposit.date} - {analysisResult.analysis.largestTransactions.deposit.description}
                              </p>
                            </div>
                          )}
                          
                          {analysisResult.analysis.largestTransactions.withdrawal && (
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <ArrowUp className="h-5 w-5 text-red-600" />
                                <h3 className="font-medium">أكبر سحب</h3>
                              </div>
                              <p className="text-2xl font-bold mb-1">
                                {formatCurrency(analysisResult.analysis.largestTransactions.withdrawal.amount || 0)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {analysisResult.analysis.largestTransactions.withdrawal.date} - {analysisResult.analysis.largestTransactions.withdrawal.description}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                          <p>لا توجد بيانات كافية لعرض أكبر المعاملات</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* المصروفات المتكررة */}
                  {analysisResult.analysis?.recurringExpenses && analysisResult.analysis.recurringExpenses.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-right">المصروفات المتكررة</CardTitle>
                        <CardDescription className="text-right">
                          المدفوعات التي تتكرر بشكل منتظم
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analysisResult.analysis.recurringExpenses.map((item: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center">
                                <Badge variant="outline">{item.frequency || 'شهري'}</Badge>
                                <p className="font-medium text-right">{item.description}</p>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-muted-foreground">{item.lastDate}</p>
                                <p className="font-bold text-right">{formatCurrency(item.amount)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* تحليلات متقدمة - غير مكتملة */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">تحليلات متقدمة</CardTitle>
                      <CardDescription className="text-right">
                        سيتم إضافة المزيد من التحليلات المتقدمة في التحديثات القادمة
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                      <Activity className="h-16 w-16 mb-4 opacity-20" />
                      <p className="text-center mb-2">قريبًا</p>
                      <p className="text-sm text-center">
                        سنقوم بإضافة تحليلات متقدمة للإنفاق، تتبع الميزانية، وتحسين توقعات التدفق النقدي
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}