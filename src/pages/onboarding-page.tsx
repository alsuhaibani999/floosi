import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/logo";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

// Define schema for each step
const personalInfoSchema = z.object({
  occupation: z.string().min(2, {
    message: "الرجاء إدخال المهنة",
  }),
  monthlyIncome: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "الرجاء إدخال دخل شهري صحيح",
  }),
});

const financialGoalsSchema = z.object({
  mainGoal: z.string().min(1, {
    message: "الرجاء اختيار هدف مالي رئيسي",
  }),
  savingTarget: z.string().refine((val) => !isNaN(Number(val)), {
    message: "الرجاء إدخال قيمة صحيحة للادخار",
  }),
});

// Infer types
type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type FinancialGoalsValues = z.infer<typeof financialGoalsSchema>;

// Onboarding steps
type Step = "welcome" | "personal-info" | "financial-goals" | "complete";

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set(["welcome"] as Step[]));
  const [onboardingData, setOnboardingData] = useState<{
    personalInfo?: PersonalInfoValues;
    financialGoals?: FinancialGoalsValues;
  }>({});

  // Forms setup
  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      occupation: "",
      monthlyIncome: "",
    },
  });

  const financialGoalsForm = useForm<FinancialGoalsValues>({
    resolver: zodResolver(financialGoalsSchema),
    defaultValues: {
      mainGoal: "",
      savingTarget: "",
    },
  });

  // Handle step completion
  const completeStep = (step: Step) => {
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(step);
    setCompletedSteps(newCompletedSteps);
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === "welcome") {
      setCurrentStep("personal-info");
      completeStep("welcome");
    } else if (currentStep === "personal-info") {
      setCurrentStep("financial-goals");
      completeStep("personal-info");
    } else if (currentStep === "financial-goals") {
      setCurrentStep("complete");
      completeStep("financial-goals");
      completeStep("complete");
    } else if (currentStep === "complete") {
      finishOnboarding();
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep === "personal-info") {
      setCurrentStep("welcome");
    } else if (currentStep === "financial-goals") {
      setCurrentStep("personal-info");
    } else if (currentStep === "complete") {
      setCurrentStep("financial-goals");
    }
  };

  // Form submission handlers
  const onPersonalInfoSubmit = (values: PersonalInfoValues) => {
    setOnboardingData({ ...onboardingData, personalInfo: values });
    goToNextStep();
  };

  const onFinancialGoalsSubmit = (values: FinancialGoalsValues) => {
    setOnboardingData({ ...onboardingData, financialGoals: values });
    goToNextStep();
  };

  // Finish onboarding and redirect to dashboard
  const finishOnboarding = async () => {
    try {
      // Here you would typically send all the collected data to your API
      // await api.post("/api/user/onboarding", onboardingData);
      toast({
        title: "تم الإعداد بنجاح!",
        description: "تم إعداد حسابك بنجاح وأنت الآن جاهز لاستخدام التطبيق.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ إعداداتك. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Step indicator component
  const StepIndicator = () => (
    <div className="w-full flex justify-center mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              href="#" 
              onClick={(e) => { 
                e.preventDefault();
                if (completedSteps.has("welcome")) setCurrentStep("welcome");
              }}
              className={`${completedSteps.has("welcome") ? "text-primary" : "text-muted-foreground"}`}
            >
              <span className="flex items-center gap-1">
                {completedSteps.has("welcome") && <Check size={16} />}
                الترحيب
              </span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink 
              href="#" 
              onClick={(e) => { 
                e.preventDefault();
                if (completedSteps.has("personal-info")) setCurrentStep("personal-info");
              }}
              className={`${completedSteps.has("personal-info") ? "text-primary" : "text-muted-foreground"}`}
            >
              <span className="flex items-center gap-1">
                {completedSteps.has("personal-info") && <Check size={16} />}
                المعلومات الشخصية
              </span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink 
              href="#" 
              onClick={(e) => { 
                e.preventDefault();
                if (completedSteps.has("financial-goals")) setCurrentStep("financial-goals");
              }}
              className={`${completedSteps.has("financial-goals") ? "text-primary" : "text-muted-foreground"}`}
            >
              <span className="flex items-center gap-1">
                {completedSteps.has("financial-goals") && <Check size={16} />}
                الأهداف المالية
              </span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white py-4">
        <div className="container flex justify-center items-center">
          <Logo size={40} />
          <h1 className="text-2xl font-bold mr-2">فلوسي - إعداد الحساب</h1>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {currentStep === "welcome" && "مرحباً بك في فلوسي!"}
              {currentStep === "personal-info" && "أخبرنا قليلاً عن نفسك"}
              {currentStep === "financial-goals" && "أهدافك المالية"}
              {currentStep === "complete" && "تم الإعداد بنجاح"}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === "welcome" && "نحن سعداء بانضمامك! دعنا نساعدك في إعداد حسابك"}
              {currentStep === "personal-info" && "هذه المعلومات ستساعدنا في تخصيص تجربتك"}
              {currentStep === "financial-goals" && "حدد أهدافك المالية لنساعدك في تحقيقها"}
              {currentStep === "complete" && "كل شيء جاهز لبدء رحلتك المالية"}
            </CardDescription>
            {currentStep !== "welcome" && <StepIndicator />}
          </CardHeader>

          <CardContent>
            {/* Welcome Step */}
            {currentStep === "welcome" && (
              <div className="space-y-6">
                <div className="bg-primary/10 rounded-lg p-6 text-center">
                  <h2 className="text-xl font-bold text-primary mb-2">مرحباً {user?.fullName || "بك"}</h2>
                  <p className="text-muted-foreground mb-4">
                    تطبيق فلوسي سيساعدك على إدارة أموالك بطريقة ذكية وفعالة. قبل أن نبدأ، دعنا نعد حسابك بشكل مناسب.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                    <div className="bg-white p-4 rounded-md shadow-sm border border-primary/20 hover:border-primary/40 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <i className="text-primary text-lg">💰</i>
                        </div>
                        <h3 className="font-bold">تتبع المصروفات</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">تتبع جميع مصروفاتك بسهولة وشاهد كيف تنفق أموالك</p>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow-sm border border-primary/20 hover:border-primary/40 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <i className="text-primary text-lg">📊</i>
                        </div>
                        <h3 className="font-bold">التحليل الذكي</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">احصل على تحليلات مفصلة عن أنماط الإنفاق والادخار</p>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow-sm border border-primary/20 hover:border-primary/40 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <i className="text-primary text-lg">🕌</i>
                        </div>
                        <h3 className="font-bold">حاسبة الزكاة</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">احسب زكاة مالك بدقة وفقاً للأحكام الشرعية</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Info Step */}
            {currentStep === "personal-info" && (
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
                  <FormField
                    control={personalInfoForm.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="text-primary text-sm">👔</i>
                          </div>
                          <FormLabel>المهنة</FormLabel>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">ادخل مهنتك الحالية لتخصيص تجربتك في التطبيق</p>
                        <FormControl>
                          <Input placeholder="مثال: مهندس، طبيب، أعمال حرة..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalInfoForm.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="text-primary text-sm">💵</i>
                          </div>
                          <FormLabel>الدخل الشهري</FormLabel>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">هذه المعلومات تساعدنا في تقديم نصائح مالية مناسبة لدخلك</p>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="أدخل دخلك الشهري التقريبي" type="number" {...field} />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-muted-foreground">ر.س</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="h-[180px]"></div> {/* Spacer to maintain consistent card height */}
                </form>
              </Form>
            )}

            {/* Financial Goals Step */}
            {currentStep === "financial-goals" && (
              <Form {...financialGoalsForm}>
                <form onSubmit={financialGoalsForm.handleSubmit(onFinancialGoalsSubmit)} className="space-y-4">
                  <FormField
                    control={financialGoalsForm.control}
                    name="mainGoal"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="text-primary text-sm">🎯</i>
                          </div>
                          <FormLabel>الهدف المالي الرئيسي</FormLabel>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">اختر هدفك المالي الرئيسي ليساعدك التطبيق على تحقيقه</p>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر هدفك المالي الرئيسي" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="saving">💰 توفير المال بشكل عام</SelectItem>
                            <SelectItem value="debt-free">🚫 سداد الديون</SelectItem>
                            <SelectItem value="home">🏠 شراء منزل</SelectItem>
                            <SelectItem value="car">🚗 شراء سيارة</SelectItem>
                            <SelectItem value="marriage">💍 الزواج</SelectItem>
                            <SelectItem value="education">🎓 تعليم أو تدريب</SelectItem>
                            <SelectItem value="retirement">👴 التقاعد</SelectItem>
                            <SelectItem value="investment">📈 الاستثمار</SelectItem>
                            <SelectItem value="business">💼 بدء مشروع تجاري</SelectItem>
                            <SelectItem value="hajj">🕋 أداء فريضة الحج أو العمرة</SelectItem>
                            <SelectItem value="other">✨ أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={financialGoalsForm.control}
                    name="savingTarget"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="text-primary text-sm">💹</i>
                          </div>
                          <FormLabel>المبلغ المستهدف للادخار شهرياً</FormLabel>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">ادخل المبلغ الذي ترغب في ادخاره شهرياً لتحقيق أهدافك المالية</p>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="أدخل المبلغ المستهدف" type="number" {...field} />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-muted-foreground">ر.س</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="h-[180px]"></div> {/* Spacer to maintain consistent card height */}
                </form>
              </Form>
            )}

            {/* Complete Step */}
            {currentStep === "complete" && (
              <div className="text-center space-y-6 py-8">
                <div className="mx-auto bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Check size={40} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">تم إعداد حسابك بنجاح!</h2>
                <p className="text-muted-foreground">
                  أنت الآن جاهز لبدء رحلتك المالية مع فلوسي. سنساعدك على تتبع مصروفاتك، وإدارة ميزانيتك، وتحقيق أهدافك المالية.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">نصائح للبدء:</h3>
                  <ul className="text-right list-disc list-inside space-y-1 text-muted-foreground">
                    <li>قم بإضافة حساباتك المصرفية</li>
                    <li>ابدأ بتسجيل معاملاتك المالية</li>
                    <li>حدد ميزانية لفئات الإنفاق المختلفة</li>
                    <li>استخدم ميزة تحليل الرسائل البنكية لتلقائية التسجيل</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === "welcome"}
              className="gap-1"
            >
              <ChevronRight size={16} />
              السابق
            </Button>

            {currentStep === "personal-info" ? (
              <Button 
                type="button" 
                onClick={() => personalInfoForm.handleSubmit(onPersonalInfoSubmit)()}
              >
                التالي
                <ChevronLeft size={16} />
              </Button>
            ) : currentStep === "financial-goals" ? (
              <Button 
                type="button" 
                onClick={() => financialGoalsForm.handleSubmit(onFinancialGoalsSubmit)()}
              >
                التالي
                <ChevronLeft size={16} />
              </Button>
            ) : (
              <Button onClick={goToNextStep}>
                {currentStep === "complete" ? "انتقال إلى لوحة القيادة" : "التالي"}
                <ChevronLeft size={16} />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}