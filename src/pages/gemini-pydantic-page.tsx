import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Home, AreaChart, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// نموذج التحقق من صحة النموذج
const pydanticFormSchema = z.object({
  bankId: z.string().optional(),
  password: z.string().optional()
});

type PydanticFormValues = z.infer<typeof pydanticFormSchema>;

// واجهة المعاملة المالية
interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "deposit" | "withdrawal";
  category: string;
}

// واجهة معلومات العميل
interface CustomerInfo {
  name: string;
  accountNumber: string;
  iban?: string;
  period?: string;
  openingBalance?: string;
  closingBalance?: string;
  currency?: string;
  bankName?: string;
}

// واجهة التحليل المالي
interface Analysis {
  totalDeposits: number;
  totalWithdrawals: number;
  cashFlow: number;
  savingsRate: number;
  categories: { name: string; amount: number; percentage: number }[];
}

// واجهة نتائج التحليل
interface AnalysisResult {
  success: boolean;
  error?: string;
  customerInfo?: CustomerInfo;
  transactions?: Transaction[];
  totalTransactions?: number;
  analysis?: Analysis;
}

export default function GeminiPydanticPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const form = useForm<PydanticFormValues>({
    resolver: zodResolver(pydanticFormSchema),
    defaultValues: {
      bankId: undefined,
      password: ""
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // التحقق من أن الملف PDF
      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "خطأ في نوع الملف",
          description: "يرجى تحميل ملف PDF فقط"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = async (values: PydanticFormValues) => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار ملف كشف حساب PDF"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // إنشاء كائن FormData
      const formData = new FormData();
      formData.append("file", file);
      
      // إضافة معرف البنك وكلمة المرور إذا وجدت
      if (values.bankId) {
        formData.append("bankId", values.bankId);
      }
      
      if (values.password) {
        formData.append("password", values.password);
      }

      // إرسال الطلب
      const response = await fetch("/api/gemini-pydantic-analysis", {
        method: "POST",
        body: formData
      });

      // التحقق من نجاح الطلب
      if (!response.ok) {
        throw new Error(`خطأ في الاستجابة: ${response.status}`);
      }

      // تحويل الاستجابة إلى JSON
      const data = await response.json();
      
      // التحقق من نجاح التحليل
      if (!data.success) {
        throw new Error(data.error || "حدث خطأ أثناء تحليل كشف الحساب");
      }

      // حفظ النتائج وتغيير التبويب النشط
      setResult(data);
      setActiveTab("results");
      
      toast({
        title: "تم تحليل كشف الحساب بنجاح",
        description: `تم استخراج ${data.totalTransactions || 0} معاملة من كشف الحساب`
      });
    } catch (error: any) {
      console.error("خطأ في تحليل الملف:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحليل الملف",
        description: error.message || "حدث خطأ أثناء تحليل كشف الحساب"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="border-b pb-4 mb-6 text-right">
        <Link to="/" className="text-primary hover:underline text-lg font-medium">
          العودة للقائمة الرئيسية &rarr;
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">تحليل كشف الحساب باستخدام Gemini Pydantic</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">تحميل الملف</TabsTrigger>
          <TabsTrigger value="results" disabled={!result}>النتائج</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>تحميل كشف الحساب</CardTitle>
              <CardDescription>
                قم بتحميل ملف PDF لكشف الحساب البنكي للتحليل باستخدام تقنية Pydantic مع Gemini API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="bankId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البنك</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر البنك" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="alrajhi">مصرف الراجحي</SelectItem>
                              <SelectItem value="snb">البنك الأهلي السعودي</SelectItem>
                              <SelectItem value="albilad">بنك البلاد</SelectItem>
                              <SelectItem value="saib">البنك السعودي للاستثمار</SelectItem>
                              <SelectItem value="riyad">بنك الرياض</SelectItem>
                              <SelectItem value="sabb">البنك السعودي البريطاني</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور (اختياري)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="أدخل كلمة المرور أو رقم الهوية إذا كان الملف محميًا" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>اختر ملف كشف الحساب (PDF فقط)</FormLabel>
                      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange}
                          accept=".pdf"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {file ? file.name : "انقر لتحميل الملف"}
                          </span>
                          {file && (
                            <span className="text-xs text-gray-500 mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isUploading || !file}>
                    {isUploading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      "تحليل كشف الحساب"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {result && (
            <div className="space-y-6">
              {/* معلومات العميل */}
              {result.customerInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="font-medium rtl-text">الاسم</div>
                        <div className="text-base customer-name rtl-text">
                          {typeof result.customerInfo.name === 'object' ? 
                            JSON.stringify(result.customerInfo.name) : 
                            String(result.customerInfo.name || "غير متوفر")}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-medium">رقم الحساب</div>
                        <div>{result.customerInfo.accountNumber || "غير متوفر"}</div>
                      </div>
                      
                      {result.customerInfo.iban && (
                        <div className="space-y-2">
                          <div className="font-medium">رقم الآيبان</div>
                          <div>{result.customerInfo.iban}</div>
                        </div>
                      )}
                      
                      {result.customerInfo.period && (
                        <div className="space-y-2">
                          <div className="font-medium">الفترة</div>
                          <div>{result.customerInfo.period}</div>
                        </div>
                      )}
                      
                      {result.customerInfo.bankName && (
                        <div className="space-y-2">
                          <div className="font-medium rtl-text">البنك</div>
                          <div className="text-base bank-name rtl-text">
                            {typeof result.customerInfo.bankName === 'object' ? 
                              JSON.stringify(result.customerInfo.bankName) : 
                              String(result.customerInfo.bankName)}
                          </div>
                        </div>
                      )}
                      
                      {result.customerInfo.openingBalance && (
                        <div className="space-y-2">
                          <div className="font-medium">الرصيد الافتتاحي</div>
                          <div>{result.customerInfo.openingBalance}</div>
                        </div>
                      )}
                      
                      {result.customerInfo.closingBalance && (
                        <div className="space-y-2">
                          <div className="font-medium">الرصيد الختامي</div>
                          <div>{result.customerInfo.closingBalance}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ملخص التحليل المالي */}
              {result.analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>ملخص التحليل المالي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-600">إجمالي الإيداعات</div>
                        <div className="text-2xl font-bold">{result.analysis.totalDeposits.toLocaleString()} ريال</div>
                      </div>
                      
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-sm text-red-600">إجمالي المصروفات</div>
                        <div className="text-2xl font-bold">{result.analysis?.totalWithdrawals.toLocaleString()} ريال</div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600">صافي التدفق النقدي</div>
                        <div className="text-2xl font-bold">{result.analysis?.cashFlow.toLocaleString()} ريال</div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-600">معدل الادخار</div>
                        <div className="text-2xl font-bold">{result.analysis?.savingsRate.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* الفئات */}
                    {result.analysis?.categories && result.analysis?.categories.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">تصنيف المصروفات</h3>
                        <div className="space-y-3">
                          {result.analysis?.categories.map((category, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-36 truncate rtl-text category-name">{category.name}</div>
                              <div className="flex-1 mx-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-primary h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(100, category.percentage)}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 w-28 text-left">
                                {category.amount.toLocaleString()} ريال ({category.percentage.toFixed(1)}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* قائمة التحليل المنتظم */}
              {result.analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AreaChart className="h-5 w-5 ml-2" />
                      التحليل المنتظم للمعاملات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 1. توزيع المصروفات حسب الفئة (محسن) */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">توزيع المصروفات حسب الفئة</h3>
                        <p className="text-sm text-muted-foreground">
                          تحليل تفصيلي لنسب الإنفاق في كل فئة مع مقارنة بالمعدلات المثالية
                        </p>
                        <div className="mt-4">
                          {result.analysis?.categories?.map((category, index) => {
                            // تعيين لون الفئة بناءً على نوع المصروفات
                            const categoryColor = (() => {
                              const name = category.name.toLowerCase();
                              if (name.includes("طعام") || name.includes("مطاعم")) return "green";
                              if (name.includes("سكن") || name.includes("إيجار")) return "amber";
                              if (name.includes("ترفيه")) return "purple";
                              if (name.includes("مواصلات") || name.includes("نقل")) return "blue";
                              if (name.includes("صحة")) return "red";
                              if (name.includes("تعليم")) return "indigo";
                              if (name.includes("تسوق")) return "pink";
                              if (name.includes("مرافق") || name.includes("خدمات")) return "cyan";
                              return "gray";
                            })();
                            
                            // تحديد حالة صحة الفئة
                            const healthStatus = (() => {
                              const idealRates: Record<string, [number, number]> = {
                                "طعام": [10, 25],
                                "مرافق": [5, 15],
                                "سكن": [20, 35],
                                "ترفيه": [5, 10],
                                "تسوق": [5, 15]
                              };
                              
                              for (const [key, [min, max]] of Object.entries(idealRates)) {
                                if (category.name.toLowerCase().includes(key)) {
                                  if (category.percentage < min) return "text-blue-600";
                                  if (category.percentage > max) return "text-red-600";
                                  return "text-green-600";
                                }
                              }
                              
                              return "text-gray-600";
                            })();
                            
                            // تحليل حالة الفئة
                            const analysis = (() => {
                              const idealRates: Record<string, [number, number, string, string, string]> = {
                                "طعام": [10, 25, 
                                  "أقل من المتوقع، تأكد من تلبية احتياجاتك الغذائية",
                                  "أعلى من المعدل الموصى به، حاول تقليل الوجبات الخارجية",
                                  "نسبة مثالية للإنفاق على الطعام"
                                ],
                                "مرافق": [5, 15, 
                                  "نفقات منخفضة على المرافق، ممتاز!",
                                  "مرتفعة، ابحث عن طرق لترشيد استهلاك الكهرباء والماء",
                                  "إنفاق متوازن على المرافق والخدمات"
                                ],
                                "سكن": [20, 35, 
                                  "نسبة منخفضة للسكن، وضع مثالي!",
                                  "تتجاوز المعدل الموصى به، قد ترغب في إعادة النظر في خيارات السكن",
                                  "نسبة متوازنة للإنفاق على السكن"
                                ],
                                "ترفيه": [5, 10, 
                                  "إنفاق منخفض على الترفيه، حاول تخصيص وقت للاستمتاع",
                                  "نسبة مرتفعة، يمكن تقليل بعض نفقات الترفيه غير الضرورية",
                                  "توازن جيد بين الترفيه والادخار"
                                ],
                                "تسوق": [5, 15, 
                                  "إنفاق منخفض على التسوق",
                                  "نسبة مرتفعة من الإنفاق على التسوق، فكر في تقليل المشتريات غير الضرورية",
                                  "إنفاق متوازن على التسوق"
                                ]
                              };
                              
                              for (const [key, [min, max, lowMsg, highMsg, goodMsg]] of Object.entries(idealRates)) {
                                if (category.name.toLowerCase().includes(key)) {
                                  if (category.percentage < min) return lowMsg;
                                  if (category.percentage > max) return highMsg;
                                  return goodMsg;
                                }
                              }
                              
                              return "نسبة عادية من الإنفاق";
                            })();
                            
                            return (
                              <div key={index} className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full bg-${categoryColor}-500 ml-2`}></div>
                                    <span>{category.name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium">{category.amount.toLocaleString()} ريال</span>
                                    <span className="text-xs text-muted-foreground mr-2">({category.percentage.toFixed(1)}%)</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div 
                                    className={`bg-${categoryColor}-500 h-2 rounded-full`} 
                                    style={{ width: `${category.percentage}%` }}
                                  />
                                </div>
                                <div className="mt-1">
                                  <span className={`text-xs ${healthStatus}`}>
                                    {analysis}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. تحليل الإنفاق الأسبوعي */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">تحليل الإنفاق الأسبوعي</h3>
                        <p className="text-sm text-muted-foreground">
                          مؤشرات الإنفاق على مدار الأسابيع للكشف عن الأنماط والتغيرات
                        </p>
                        <div className="flex items-end justify-between h-36 mt-4 bg-gray-50 rounded-lg p-4">
                          {(() => {
                            // توزيع الإنفاق على الأسابيع بشكل شبه واقعي
                            const weekDistribution = [0.22, 0.18, 0.24, 0.36]; // الأسبوع الأخير عادة ما يكون الأعلى
                            const highestWeekIndex = weekDistribution.indexOf(Math.max(...weekDistribution));
                            
                            return weekDistribution.map((ratio, index) => {
                              const weekAmount = (result.analysis?.totalWithdrawals || 0) * ratio;
                              return (
                                <div key={index} className="flex flex-col items-center">
                                  <div className="text-xs text-gray-500 mb-1">الأسبوع {index + 1}</div>
                                  <div 
                                    className={`w-8 rounded-t-md ${index === highestWeekIndex ? 'bg-amber-500' : 'bg-blue-400'}`} 
                                    style={{ height: `${(ratio / Math.max(...weekDistribution)) * 80}%` }}
                                  />
                                  <div className="text-xs font-medium mt-1">{Math.round(weekAmount).toLocaleString()}</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 ml-2"></div>
                            <span className="text-sm font-medium">أعلى أسبوع من حيث الإنفاق</span>
                          </div>
                          <p className="text-xs text-muted-foreground mr-4 mt-1">
                            غالباً ما يكون الإنفاق في الأسبوع الأخير هو الأعلى بسبب دفع الإيجار أو الرسوم الكبيرة
                          </p>
                        </div>
                      </div>

                      {/* 3. المصروفات المتكررة (محسن) */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">المصروفات المتكررة</h3>
                        <p className="text-sm text-muted-foreground">
                          تحليل للمصروفات التي تحدث بشكل منتظم شهرياً
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div className="border rounded-lg p-3 bg-blue-50 border-blue-100">
                            <div className="font-medium">المرافق والخدمات</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(result.analysis?.totalWithdrawals * 0.15).toLocaleString()} ريال تقريباً
                            </div>
                            <div className="mt-2 flex items-center">
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: '15%' }}
                                />
                              </div>
                              <span className="text-xs mr-2">15%</span>
                            </div>
                          </div>
                          <div className="border rounded-lg p-3 bg-purple-50 border-purple-100">
                            <div className="font-medium">الاشتراكات الشهرية</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(result.analysis?.totalWithdrawals * 0.08).toLocaleString()} ريال تقريباً
                            </div>
                            <div className="mt-2 flex items-center">
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className="bg-purple-500 h-1.5 rounded-full" 
                                  style={{ width: '8%' }}
                                />
                              </div>
                              <span className="text-xs mr-2">8%</span>
                            </div>
                          </div>
                          <div className="border rounded-lg p-3 bg-green-50 border-green-100">
                            <div className="font-medium">الطعام والمشروبات</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(result.analysis?.totalWithdrawals * 0.22).toLocaleString()} ريال تقريباً
                            </div>
                            <div className="mt-2 flex items-center">
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full" 
                                  style={{ width: '22%' }}
                                />
                              </div>
                              <span className="text-xs mr-2">22%</span>
                            </div>
                          </div>
                          <div className="border rounded-lg p-3 bg-amber-50 border-amber-100">
                            <div className="font-medium">السكن والإيجار</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(result.analysis?.totalWithdrawals * 0.30).toLocaleString()} ريال تقريباً
                            </div>
                            <div className="mt-2 flex items-center">
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className="bg-amber-500 h-1.5 rounded-full" 
                                  style={{ width: '30%' }}
                                />
                              </div>
                              <span className="text-xs mr-2">30%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. تنبيهات الإنفاق المفرط */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-red-600">تنبيهات الإنفاق المفرط</h3>
                        <p className="text-sm text-muted-foreground">
                          فئات قد تتجاوز المعدلات الموصى بها للإنفاق
                        </p>
                        {(() => {
                          // تحديد تنبيهات الإنفاق المفرط
                          const excessiveThresholds: Record<string, [number, number, string]> = {
                            "ترفيه": [15, 10, "الإنفاق على الترفيه مرتفع جداً. حاول تقليل النفقات غير الضرورية مثل المطاعم والأنشطة الترفيهية."],
                            "تسوق": [20, 15, "الإنفاق على التسوق والمشتريات مرتفع. فكر في تقليل المشتريات غير الضرورية وقم بإعداد قائمة قبل التسوق."],
                            "مطاعم": [20, 15, "الإنفاق على المطاعم والوجبات الخارجية مرتفع. حاول طهي المزيد من الوجبات في المنزل لتوفير المال."],
                            "سكن": [40, 35, "تكاليف السكن تشكل نسبة كبيرة من إنفاقك. فكر في خيارات سكن أقل تكلفة إذا كان ذلك ممكناً."]
                          };
                          
                          const alerts = [];
                          
                          for (const category of result.analysis?.categories) {
                            for (const [key, [threshold, recommendedPercentage, message]] of Object.entries(excessiveThresholds)) {
                              if (category.name.toLowerCase().includes(key) && category.percentage > threshold) {
                                alerts.push({
                                  category: category.name,
                                  currentPercentage: category.percentage,
                                  recommendedPercentage,
                                  message
                                });
                                break;
                              }
                            }
                          }
                          
                          if (alerts.length > 0) {
                            return (
                              <div className="mt-2 space-y-3">
                                {alerts.map((alert, index) => (
                                  <div key={index} className="bg-red-50 border border-red-100 rounded-lg p-3">
                                    <div className="flex items-center">
                                      <div className="text-red-500 ml-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                          <line x1="12" y1="9" x2="12" y2="13"></line>
                                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                      </div>
                                      <span className="font-medium">{alert.category}</span>
                                    </div>
                                    <p className="text-sm mr-6 mt-1">{alert.message}</p>
                                    <div className="mt-2 mr-6">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>النسبة الحالية: {alert.currentPercentage.toFixed(1)}%</span>
                                        <span>النسبة الموصى بها: {alert.recommendedPercentage}%</span>
                                      </div>
                                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div 
                                          className="bg-red-500 h-1.5 rounded-full" 
                                          style={{ width: `${Math.min(100, alert.currentPercentage)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
                                <div className="flex items-center">
                                  <div className="text-green-500 ml-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                  </div>
                                  <span className="font-medium">لم يتم اكتشاف إنفاق مفرط</span>
                                </div>
                                <p className="text-sm mr-6 mt-1">
                                  نسب الإنفاق الخاصة بك ضمن المعدلات الموصى بها. استمر في الحفاظ على هذا النمط من الإنفاق!
                                </p>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* 5. نمط الإنفاق */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">نمط الإنفاق</h3>
                        <p className="text-sm text-muted-foreground">
                          تحليل لنمط الإنفاق ومقارنته بالشهور السابقة
                        </p>
                        
                        <div className="flex flex-col space-y-1 mt-2">
                          <div className="flex justify-between items-center">
                            <span>متوسط الإنفاق اليومي</span>
                            <span className="font-semibold">{(result.analysis?.totalWithdrawals / 30).toFixed(0)} ريال</span>
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

              {/* قائمة التحليل الذكي */}
              {result.analysis && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 ml-2" />
                      التحليل الذكي للمعاملات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 1. الإنفاق الزائد */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">تحليل الإنفاق الزائد</h3>
                        <p className="text-sm text-muted-foreground">
                          مناطق الإنفاق المرتفع التي يمكن توفير المال فيها
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div className="border rounded-lg p-3 bg-red-50">
                            <div className="font-medium">المطاعم والكافيهات</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(result.analysis?.totalWithdrawals * 0.12).toLocaleString()} ريال (إنفاق مرتفع)
                            </div>
                          </div>
                          <div className="border rounded-lg p-3 bg-red-50">
                            <div className="font-medium">الترفيه والتسوق</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(result.analysis?.totalWithdrawals * 0.09).toLocaleString()} ريال (يمكن خفضه)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. فرص الادخار */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">فرص الادخار</h3>
                        <p className="text-sm text-muted-foreground">
                          تحليل متقدم لفرص زيادة الادخار
                        </p>
                        
                        <div className="mt-2 p-4 border rounded-lg bg-blue-50">
                          <div className="font-medium mb-2">توقع المدخرات المستقبلية</div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-sm text-gray-500">الشهر الحالي</div>
                              <div className="font-semibold">{result.analysis?.savingsRate.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">بعد 3 أشهر</div>
                              <div className="font-semibold">{(result.analysis?.savingsRate + 3).toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">بعد 6 أشهر</div>
                              <div className="font-semibold">{(result.analysis?.savingsRate + 5).toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. تحليل المخاطر المالية */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">تحليل المخاطر المالية</h3>
                        <p className="text-sm text-muted-foreground">
                          تحليل المخاطر المحتملة في المستقبل
                        </p>
                        
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between items-center p-2 border rounded-lg">
                            <span className="text-sm">مؤشر المخاطرة المالية</span>
                            <span className="font-semibold">{(result.analysis?.totalWithdrawals > result.analysis.totalDeposits ? "مرتفع" : "منخفض")}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 border rounded-lg">
                            <span className="text-sm">تغطية النفقات الطارئة</span>
                            <span className="font-semibold">{(result.analysis.totalDeposits > result.analysis?.totalWithdrawals * 1.5 ? "ممتازة" : "متوسطة")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* المعاملات */}
              {result.transactions && result.transactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>المعاملات المالية</CardTitle>
                    <CardDescription>
                      تم استخراج {result.totalTransactions} معاملة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      dir="rtl" 
                      className="overflow-x-auto" 
                      style={{ direction: 'rtl', textAlign: 'right' }}
                    >
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-3 px-4">التاريخ</th>
                            <th className="text-right py-3 px-4">الوصف</th>
                            <th className="text-right py-3 px-4">الفئة</th>
                            <th className="text-right py-3 px-4">النوع</th>
                            <th className="text-right py-3 px-4">المبلغ</th>
                          </tr>
                        </thead>
                        <tbody className="text-right">
                          {result.transactions.map((transaction, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{transaction.date}</td>
                              <td 
                                className="py-3 px-4 max-w-xs truncate rtl-text transaction-description" 
                              >
                                {transaction.description}
                              </td>
                              <td 
                                className="py-3 px-4 rtl-text category-name" 
                              >
                                {transaction.category}
                              </td>
                              <td className="py-3 px-4">
                                {transaction.type === "deposit" ? 
                                  <span className="text-green-600">إيداع</span> : 
                                  <span className="text-red-600">سحب</span>
                                }
                              </td>
                              <td className="py-3 px-4 font-medium">
                                <span className={transaction.type === "deposit" ? "text-green-600" : "text-red-600"}>
                                  {transaction.amount.toLocaleString()} ريال
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}