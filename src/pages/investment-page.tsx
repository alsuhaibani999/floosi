import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { TrendingUp, CircleDollarSign, Building, PiggyBank, Landmark } from 'lucide-react';

const InvestmentPage: React.FC = () => {
  const investmentChannels = [
    {
      title: 'صناديق الاستثمار المتوافقة مع الشريعة',
      description: 'استثمر في صناديق مُنتقاة بعناية وموافقة من هيئات شرعية',
      icon: <CircleDollarSign className="h-8 w-8 text-primary" />,
      comingSoon: false
    },
    {
      title: 'الصكوك الإسلامية',
      description: 'شهادات استثمارية متوافقة مع أحكام الشريعة الإسلامية',
      icon: <Landmark className="h-8 w-8 text-primary" />,
      comingSoon: false
    },
    {
      title: 'الأسهم المتوافقة مع الشريعة',
      description: 'استثمر في أسهم شركات تتوافق أنشطتها مع الشريعة الإسلامية',
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      comingSoon: false
    },
    {
      title: 'العقارات',
      description: 'فرص استثمارية في القطاع العقاري بعوائد ثابتة',
      icon: <Building className="h-8 w-8 text-primary" />,
      comingSoon: true
    },
    {
      title: 'المدخرات الإسلامية',
      description: 'حسابات ادخار متوافقة مع الشريعة بعوائد مستقرة',
      icon: <PiggyBank className="h-8 w-8 text-primary" />,
      comingSoon: true
    }
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">الاستثمار الإسلامي</h2>
        <p className="text-gray-500">اكتشف فرص استثمارية متوافقة مع الشريعة الإسلامية</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investmentChannels.map((channel, index) => (
          <Card key={index} className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="mb-2">{channel.icon}</div>
              <CardTitle>{channel.title}</CardTitle>
              <CardDescription>{channel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {channel.comingSoon ? (
                <div className="text-sm bg-muted inline-block px-3 py-1 rounded-full">
                  قريباً
                </div>
              ) : (
                <div className="text-sm bg-primary/10 text-primary inline-block px-3 py-1 rounded-full">
                  متاح الآن
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 mb-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
        <h3 className="text-xl font-semibold mb-4">مبادئ الاستثمار الإسلامي</h3>
        <ul className="space-y-2 list-disc pr-5">
          <li>تجنب الربا (الفائدة) في جميع المعاملات</li>
          <li>الابتعاد عن الشركات التي تتعامل في الأنشطة المحرمة</li>
          <li>تجنب الغرر (الجهالة) والميسر (القمار) في عقود الاستثمار</li>
          <li>المشاركة في الربح والخسارة</li>
          <li>تحقيق منفعة حقيقية للمجتمع من خلال الاستثمارات</li>
        </ul>

        <p className="mt-4 text-sm text-muted-foreground">
          * جميع الفرص الاستثمارية المعروضة تتوافق مع أحكام الشريعة الإسلامية وتخضع لمراجعة هيئات شرعية متخصصة
        </p>
      </div>
      
      {/* قسم المعادلات والقواعد المالية */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">المعادلات والقواعد المالية</h2>
        <p className="text-gray-500 mb-6">قواعد ومعادلات مالية هامة لتحقيق الاستقرار المالي والتخطيط الاستثماري السليم</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>معادلة نسبة المدخرات</CardTitle>
              <CardDescription>حساب نسبة المدخرات من إجمالي الدخل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md text-center">
                <span className="font-medium">(إجمالي الدخل - إجمالي المصروفات)</span>
                <div className="border-t border-border my-2"></div>
                <span className="font-medium">إجمالي الدخل</span>
                <span className="mr-2">× 100</span>
              </div>
              <div className="text-center p-3 mt-3 bg-primary/5 rounded-md">
                <span className="block text-xs text-muted-foreground">النسبة المثالية: 20% أو أكثر</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>معادلة نسبة السكن</CardTitle>
              <CardDescription>حساب نسبة تكاليف السكن من إجمالي الدخل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md text-center">
                <span className="font-medium">إجمالي تكاليف السكن</span>
                <div className="border-t border-border my-2"></div>
                <span className="font-medium">إجمالي الدخل</span>
                <span className="mr-2">× 100</span>
              </div>
              <div className="text-center p-3 mt-3 bg-primary/5 rounded-md">
                <span className="block text-xs text-muted-foreground">النسبة المثالية: أقل من 30%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>معادلة نسبة الديون</CardTitle>
              <CardDescription>حساب نسبة مدفوعات الديون من إجمالي الدخل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md text-center">
                <span className="font-medium">إجمالي مدفوعات الديون</span>
                <div className="border-t border-border my-2"></div>
                <span className="font-medium">إجمالي الدخل</span>
                <span className="mr-2">× 100</span>
              </div>
              <div className="text-center p-3 mt-3 bg-primary/5 rounded-md">
                <span className="block text-xs text-muted-foreground">النسبة المثالية: أقل من 36%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>قاعدة 50/30/20</CardTitle>
              <CardDescription>توزيع الدخل الشهري بنسب متوازنة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md text-center space-y-2">
                <div><span className="font-medium text-blue-600">50%</span> للضروريات</div>
                <div><span className="font-medium text-purple-600">30%</span> للكماليات</div>
                <div><span className="font-medium text-green-600">20%</span> للادخار</div>
              </div>
              <div className="text-center p-3 mt-3 bg-primary/5 rounded-md">
                <span className="block text-xs text-muted-foreground">تقسيم مثالي للدخل الشهري</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>معدل الكفاية المالية</CardTitle>
              <CardDescription>حساب فترة الكفاية المالية في حالة انقطاع الدخل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md text-center">
                <span className="font-medium">إجمالي المدخرات</span>
                <div className="border-t border-border my-2"></div>
                <span className="font-medium">متوسط المصروفات الشهرية</span>
              </div>
              <div className="text-center p-3 mt-3 bg-primary/5 rounded-md">
                <span className="block text-xs text-muted-foreground">الفترة المثالية: 3-6 أشهر على الأقل</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>مؤشر مصروفات الرفاهية</CardTitle>
              <CardDescription>حساب نسبة مصروفات الرفاهية من إجمالي الدخل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md text-center">
                <span className="font-medium">إجمالي مصروفات الرفاهية</span>
                <div className="border-t border-border my-2"></div>
                <span className="font-medium">إجمالي الدخل</span>
                <span className="mr-2">× 100</span>
              </div>
              <div className="text-center p-3 mt-3 bg-primary/5 rounded-md">
                <span className="block text-xs text-muted-foreground">النسبة المتوازنة: أقل من 10%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default InvestmentPage;