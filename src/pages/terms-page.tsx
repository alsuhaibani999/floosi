import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Logo from "@/components/logo";

export default function TermsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center p-6 bg-primary/5 border-b">
        <div className="max-w-5xl w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={30} />
            <h1 className="text-xl font-bold">فلوسي</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            العودة إلى التسجيل
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">الشروط والأحكام وسياسة الخصوصية</h1>
        
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">شروط الاستخدام</h2>
            <p className="text-muted-foreground">
              مرحباً بك في تطبيق "فلوسي" لإدارة المصروفات الشخصية. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بالشروط والأحكام التالية.
            </p>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">1. استخدام التطبيق</h3>
              <p className="text-muted-foreground">
                يوفر تطبيق "فلوسي" خدمات لإدارة الأموال الشخصية. يجب استخدام التطبيق بما يتوافق مع القوانين واللوائح المعمول بها في المملكة العربية السعودية.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">2. الحسابات الشخصية</h3>
              <p className="text-muted-foreground">
                عند إنشاء حساب في تطبيق "فلوسي"، أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. أنت مسؤول عن جميع الأنشطة التي تتم من خلال حسابك.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">3. الاستخدام المقبول</h3>
              <p className="text-muted-foreground">
                يجب عدم استخدام تطبيق "فلوسي" لأي غرض غير مشروع أو غير مصرح به. يحظر استخدام التطبيق لأي نشاط قد يؤدي إلى تعطيل أو إضرار بالخدمة أو بالمستخدمين الآخرين.
              </p>
            </div>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">سياسة الخصوصية</h2>
            <p className="text-muted-foreground">
              نحن نلتزم بحماية خصوصيتك. تشرح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية الخاصة بك.
            </p>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">1. المعلومات التي نجمعها</h3>
              <p className="text-muted-foreground">
                نجمع معلومات شخصية مثل الاسم وعنوان البريد الإلكتروني ورقم الهاتف، بالإضافة إلى معلومات مالية تقوم بإدخالها في التطبيق مثل المعاملات والمصروفات والإيرادات وأرصدة الحسابات.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">2. كيفية استخدام المعلومات</h3>
              <p className="text-muted-foreground">
                نستخدم المعلومات التي نجمعها لتقديم وتحسين خدماتنا، وتخصيص تجربتك، وتوفير تحليلات مالية دقيقة، والتواصل معك بشأن حسابك والتحديثات والميزات الجديدة.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">3. حماية المعلومات</h3>
              <p className="text-muted-foreground">
                نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية والمالية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف غير المصرح به. البيانات المالية مشفرة ومحمية وفقًا لأعلى معايير الأمان.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">4. مشاركة المعلومات</h3>
              <p className="text-muted-foreground">
                لا نبيع أو نؤجر أو نتاجر بمعلوماتك الشخصية مع أطراف ثالثة. قد نشارك المعلومات مع مقدمي الخدمات الموثوق بهم الذين يساعدوننا في تشغيل التطبيق وتقديم الخدمات، ولكن فقط بالقدر اللازم ومع الالتزام باتفاقيات السرية.
              </p>
            </div>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">الموافقة على الشروط</h2>
            <p className="text-muted-foreground">
              باستخدامك لتطبيق "فلوسي"، فإنك توافق على شروط الاستخدام وسياسة الخصوصية. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام التطبيق.
            </p>
          </section>
          
          <div className="pt-6 text-center">
            <Button onClick={() => navigate("/auth")} className="w-full max-w-sm">
              العودة إلى صفحة التسجيل
            </Button>
          </div>
        </div>
      </div>
      
      <div className="py-6 border-t text-center text-sm text-muted-foreground">
        جميع الحقوق محفوظة © فلوسي {new Date().getFullYear()}
      </div>
    </div>
  );
}