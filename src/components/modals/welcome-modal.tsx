import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserCheck, ArrowRight, PieChart, CreditCard, Wallet, Home, Car, Receipt, Banknote, TrendingUp } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [step, setStep] = React.useState<number>(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size={48} />
          </div>
          <DialogTitle className="text-2xl">
            {step === 1 && `مرحباً بك في فلوسي${userName ? ` يا ${userName}` : ''}!`}
            {step === 2 && 'ميزات التطبيق'}
            {step === 3 && 'إدارة مصروفاتك وإيراداتك'}
            {step === 4 && 'دعنا نبدأ!'}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {step === 1 && 'نحن سعداء بانضمامك إلينا. فلوسي هو تطبيق مالي إسلامي يساعدك على إدارة أموالك وتحقيق أهدافك المالية.'}
            {step === 2 && 'تعرف على أهم الميزات التي يوفرها التطبيق لك'}
            {step === 3 && 'يمكنك تتبع مختلف أنواع المصروفات والإيرادات بسهولة'}
            {step === 4 && 'هل أنت جاهز لبدء رحلتك المالية؟ إليك بعض الخطوات الأولى'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="py-6">
            <div className="flex items-center justify-center bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4">
              <UserCheck className="h-10 w-10 text-primary" />
            </div>
            <p className="text-center text-muted-foreground mb-4">
              تم إنشاء حسابك بنجاح. سنساعدك على إدارة أموالك، وتتبع مصروفاتك، والادخار لأهدافك المالية.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="py-4 space-y-4">
            <div className="bg-card border rounded-lg p-3 flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">حساباتك وتعاملاتك المالية</h3>
                <p className="text-sm text-muted-foreground">تتبع حساباتك المصرفية ومعاملاتك المالية في مكان واحد</p>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg p-3 flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">تحليلات وتقارير مفصلة</h3>
                <p className="text-sm text-muted-foreground">رسوم بيانية واضحة وتحليلات ذكية لأنماط الإنفاق والادخار</p>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg p-3 flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">قنوات الاستثمار</h3>
                <p className="text-sm text-muted-foreground">اكتشف فرص استثمارية متوافقة مع الشريعة الإسلامية</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-4 space-y-5">
            <div>
              <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                <span>الإيرادات</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border rounded-md p-2 text-center">
                  <span className="text-sm">الراتب</span>
                </div>
                <div className="bg-card border rounded-md p-2 text-center">
                  <span className="text-sm">عمل إضافي</span>
                </div>
                <div className="bg-card border rounded-md p-2 text-center">
                  <span className="text-sm">استثمارات</span>
                </div>
                <div className="bg-card border rounded-md p-2 text-center">
                  <span className="text-sm">أرباح تجارية</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <span>المصروفات الشائعة</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border rounded-md p-2 text-center flex flex-col items-center">
                  <Home className="h-4 w-4 mb-1 text-muted-foreground" />
                  <span className="text-sm">إيجار سكن</span>
                </div>
                <div className="bg-card border rounded-md p-2 text-center flex flex-col items-center">
                  <Car className="h-4 w-4 mb-1 text-muted-foreground" />
                  <span className="text-sm">قسط السيارة</span>
                </div>
                <div className="bg-card border rounded-md p-2 text-center flex flex-col items-center">
                  <Receipt className="h-4 w-4 mb-1 text-muted-foreground" />
                  <span className="text-sm">فواتير الخدمات</span>
                </div>
                <div className="bg-card border rounded-md p-2 text-center flex flex-col items-center">
                  <CreditCard className="h-4 w-4 mb-1 text-muted-foreground" />
                  <span className="text-sm">مشتريات</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 4 && (
          <div className="py-4 space-y-4">
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4">
                  <div className="rounded-full bg-primary/20 w-4 h-4 flex items-center justify-center">
                    <span className="text-primary text-xs">١</span>
                  </div>
                </div>
                <p>قم بإضافة حساباتك المصرفية من قسم "الحسابات"</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4">
                  <div className="rounded-full bg-primary/20 w-4 h-4 flex items-center justify-center">
                    <span className="text-primary text-xs">٢</span>
                  </div>
                </div>
                <p>سجل معاملاتك المالية لتتبع مصروفاتك وإيراداتك</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4">
                  <div className="rounded-full bg-primary/20 w-4 h-4 flex items-center justify-center">
                    <span className="text-primary text-xs">٣</span>
                  </div>
                </div>
                <p>حدد أهدافك المالية في قسم "الإعدادات" لمساعدتك في تحقيقها</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-4">
                  <div className="rounded-full bg-primary/20 w-4 h-4 flex items-center justify-center">
                    <span className="text-primary text-xs">٤</span>
                  </div>
                </div>
                <p>استخدم ميزة تحليل الرسائل البنكية لتسجيل معاملاتك تلقائياً</p>
              </li>
            </ul>
          </div>
        )}

        <DialogFooter className="flex sm:justify-between">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${index + 1 === step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <Button onClick={nextStep} className="gap-1">
            {step === totalSteps ? 'ابدأ الآن' : 'التالي'}
            <ArrowRight className="h-4 w-4 -rotate-90" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}