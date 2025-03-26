import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Logo from '@/components/logo';
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Redirect to home if logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login validation schema
  const loginSchema = z.object({
    username: z.string().min(1, "يرجى إدخال اسم المستخدم"),
    password: z.string().min(1, "يرجى إدخال كلمة المرور"),
    rememberMe: z.boolean().default(false),
  });

  // Register validation schema
  const registerSchema = insertUserSchema.extend({
    fullName: z.string().min(2, "الاسم يجب أن يحتوي على الأقل حرفين"),
    confirmPassword: z.string().min(6, "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل"),
    phone: z.string().optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: "يجب الموافقة على شروط الاستخدام",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

  // تحقق مما إذا كان المستخدم قد اختار تذكرني سابقًا
  const rememberedUsername = typeof window !== 'undefined' ? localStorage.getItem('rememberedUsername') : '';
  
  // Initialize forms
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: rememberedUsername || "",
      password: "",
      rememberMe: !!rememberedUsername,
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      acceptTerms: false,
    },
  });

  // Login form submit handler
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    await loginMutation.mutateAsync(values);
  };

  // Register form submit handler
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...registerData } = values;
    await registerMutation.mutateAsync(registerData);
  };

  return (
    <div className="min-h-screen">
      <div className="grid md:grid-cols-2 h-screen" dir="rtl">
        {/* جانب النموذج (يسار) */}
        <div className="flex items-center justify-center p-6 order-last">
          <div className="w-full max-w-md">
            <Card className="w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Logo size={50} />
                </div>
                <CardTitle className="text-2xl">مرحباً بك في فلوسي</CardTitle>
                <CardDescription>
                  التطبيق الأمثل لإدارة أموالك ومصاريفك
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                    <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Form */}
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم المستخدم</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل اسم المستخدم أو البريد الإلكتروني" type="text" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="أدخل كلمة المرور" 
                                    type={showLoginPassword ? "text" : "password"} 
                                    {...field} 
                                  />
                                  <button 
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    tabIndex={-1}
                                  >
                                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row-reverse items-start space-x-3 space-y-0 rtl:space-x-reverse mb-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none text-right ml-3">
                                <FormLabel className="cursor-pointer">
                                  تذكرني
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <span className="flex items-center gap-2">
                              <i className="ri-loader-4-line animate-spin"></i>
                              جاري تسجيل الدخول...
                            </span>
                          ) : (
                            "تسجيل الدخول"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  {/* Register Form */}
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الاسم الكامل</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل اسمك الكامل" type="text" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>البريد الإلكتروني</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل بريدك الإلكتروني" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الجوال</FormLabel>
                              <FormControl>
                                <Controller
                                  name="phone"
                                  control={registerForm.control}
                                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <div>
                                      <PhoneInput
                                        international
                                        defaultCountry="SA"
                                        placeholder="أدخل رقم الجوال"
                                        value={value}
                                        onChange={onChange}
                                        className={`w-full flex h-10 border ${error ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm rounded-md !important`}
                                      />
                                      {error && (
                                        <p className="text-xs text-red-500 mt-1">يجب إدخال 9 أرقام بعد مفتاح الدولة</p>
                                      )}
                                    </div>
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="أدخل كلمة المرور" 
                                    type={showPassword ? "text" : "password"} 
                                    {...field} 
                                  />
                                  <button 
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                  >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأكيد كلمة المرور</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="أعد إدخال كلمة المرور" 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    {...field} 
                                  />
                                  <button 
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                  >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row-reverse items-start space-x-3 space-y-0 rtl:space-x-reverse">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none text-right ml-3">
                                <FormLabel className="flex gap-1 items-center justify-end">
                                  <a 
                                    href="/terms" 
                                    className="text-primary underline hover:text-primary/80" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    شروط الاستخدام وسياسة الخصوصية
                                  </a>
                                  أوافق على 
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <span className="flex items-center gap-2">
                              <i className="ri-loader-4-line animate-spin"></i>
                              جاري إنشاء الحساب...
                            </span>
                          ) : (
                            "إنشاء حساب"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <p>حقوق الطبع &copy; فلوسي 2025</p>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* جانب الوصف (يمين) */}
        <div className="bg-primary flex items-center justify-center p-8 order-first">
          <div className="max-w-md mx-auto text-white">
            <div className="mb-8 text-center">
              <Logo size={80} showText={false} className="mb-4 mx-auto" />
              <h1 className="text-3xl font-bold mb-2">فلوسي</h1>
              <p className="text-lg opacity-90">تطبيق متكامل وفعال لإدارة مصروفاتك بطرق فعالة</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 text-right">
                <div className="mt-1 p-2 rounded-full bg-white shrink-0">
                  <i className="ri-shield-check-line text-xl text-green-500"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-300">آمن وموثوق</h3>
                  <p className="opacity-90">بياناتك المالية محمية ومشفرة بأحدث تقنيات الأمان</p>
                  <span className="text-sm text-blue-300 block mt-1">قريباً: بوابة نفاذ</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 text-right">
                <div className="mt-1 p-2 rounded-full bg-white shrink-0">
                  <i className="ri-pie-chart-line text-xl text-purple-500"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-300">تحليل ذكي</h3>
                  <p className="opacity-90">تحليل تلقائي لمصروفاتك وتصنيفها بشكل ذكي وتزويدك بتقارير دورية مفصلة</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 text-right">
                <div className="mt-1 p-2 rounded-full bg-white shrink-0">
                  <i className="ri-bank-line text-xl text-yellow-500"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-300">تكامل مع البنوك</h3>
                  <p className="opacity-90">تحليل تلقائي للرسائل البنكية وتسجيل المعاملات</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}