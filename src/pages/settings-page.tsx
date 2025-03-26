import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(3, { message: "الاسم يجب أن يتكون من 3 أحرف على الأقل" }),
  username: z.string().email({ message: "يجب إدخال بريد إلكتروني صحيح" }).readonly(),
  phone: z.string().optional(),
});

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "كلمة المرور الحالية مطلوبة" }),
  newPassword: z.string().min(6, { message: "كلمة المرور الجديدة يجب أن تتكون من 6 أحرف على الأقل" }),
  confirmPassword: z.string().min(1, { message: "تأكيد كلمة المرور مطلوب" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      username: user?.username || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormValues>) => {
      const res = await apiRequest('PATCH', '/api/user', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث البيانات",
        description: "تم تحديث بياناتك الشخصية بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
      const res = await apiRequest('POST', '/api/user/change-password', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    const { username, ...updateData } = values;
    updateProfileMutation.mutate(updateData);
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    const { currentPassword, newPassword } = values;
    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">الإعدادات</h2>
        <p className="text-gray-500">إدارة حسابك وتخصيص التطبيق</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm">
          <TabsList className="w-full border-b rounded-none p-0">
            <TabsTrigger
              value="profile"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4"
            >
              <div className="flex items-center gap-2">
                <i className="ri-user-line"></i>
                <span>الملف الشخصي</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4"
            >
              <div className="flex items-center gap-2">
                <i className="ri-shield-keyhole-line"></i>
                <span>الأمان</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4"
            >
              <div className="flex items-center gap-2">
                <i className="ri-settings-line"></i>
                <span>التفضيلات</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="p-6 focus:outline-none">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        البريد الإلكتروني يستخدم كاسم مستخدم ولا يمكن تغييره
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الجوال (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        يستخدم للتواصل وللتحقق الثنائي
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto" 
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      جاري الحفظ...
                    </span>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="security" className="p-6 focus:outline-none">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">تغيير كلمة المرور</h3>
                  
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور الحالية</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور الجديدة</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              يجب أن تكون كلمة المرور على الأقل 6 أحرف
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full sm:w-auto" 
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <i className="ri-loader-4-line animate-spin"></i>
                            جاري التغيير...
                          </span>
                        ) : (
                          "تغيير كلمة المرور"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">المصادقة الثنائية</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">تفعيل المصادقة الثنائية</p>
                      <p className="text-sm text-gray-500">تعزيز أمان حسابك باستخدام رمز تحقق إضافي</p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">الأجهزة المتصلة</h3>
                  <div className="border rounded-lg p-4 mb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <i className="ri-smartphone-line text-xl"></i>
                        <div>
                          <p className="font-medium">جهازك الحالي</p>
                          <p className="text-sm text-gray-500">متصل منذ قليل</p>
                        </div>
                      </div>
                      <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        حالي
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="p-6 focus:outline-none">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">العملة</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">العملة الرئيسية</p>
                      <p className="text-sm text-gray-500">العملة المستخدمة في عرض المبالغ</p>
                    </div>
                    <div className="w-28">
                      <select className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="SAR">ريال سعودي</option>
                        <option value="USD">دولار أمريكي</option>
                        <option value="EUR">يورو</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">اللغة</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">لغة التطبيق</p>
                      <p className="text-sm text-gray-500">اللغة المستخدمة في واجهة التطبيق</p>
                    </div>
                    <div className="w-28">
                      <select className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="ar">العربية</option>
                        <option value="en">الإنجليزية</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">الإشعارات</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">إشعارات المعاملات</p>
                        <p className="text-sm text-gray-500">إشعارات عند إضافة أو تعديل المعاملات</p>
                      </div>
                      <Switch id="transaction-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">تذكيرات الميزانية</p>
                        <p className="text-sm text-gray-500">إشعارات عند اقتراب حدود الإنفاق</p>
                      </div>
                      <Switch id="budget-reminders" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">نصائح مالية</p>
                        <p className="text-sm text-gray-500">نصائح وتلميحات مالية أسبوعية</p>
                      </div>
                      <Switch id="financial-tips" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </AppShell>
  );
};

export default SettingsPage;
