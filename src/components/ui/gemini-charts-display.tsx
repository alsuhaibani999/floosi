import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BarChart, LineChart, PieChart, Presentation } from "lucide-react";
import { useEffect, useState } from "react";

interface GeminiChartsDisplayProps {
  charts?: {
    category_pie?: string;
    time_series?: string;
    monthly_expenses?: string;
    top_transactions?: string;
    [key: string]: string | undefined;
  };
  className?: string;
}

export function GeminiChartsDisplay({ charts, className }: GeminiChartsDisplayProps) {
  const [activeTab, setActiveTab] = useState<string>("category");
  const [iframeLoaded, setIframeLoaded] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    // Reset iframe loaded state when charts change
    if (charts) {
      setIframeLoaded({});
    }
  }, [charts]);

  if (!charts) {
    return (
      <Alert variant="default" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>تنبيه</AlertTitle>
        <AlertDescription>
          لم يتم إنشاء مخططات بيانية بعد. قم بتحميل كشف حساب وتحليله باستخدام Google Gemini أولاً.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if any charts are available
  const hasCharts = Object.values(charts).some(chart => !!chart);
  
  if (!hasCharts) {
    return (
      <Alert variant="default" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>تنبيه</AlertTitle>
        <AlertDescription>
          لم يتم إنشاء مخططات بيانية. قد يكون ذلك بسبب عدم وجود معاملات كافية للتحليل.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Presentation className="h-5 w-5 ml-2" />
          تحليل مالي بواسطة Google Gemini
        </CardTitle>
        <CardDescription>
          تحليل متقدم لمعاملاتك المالية باستخدام الذكاء الاصطناعي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="grid grid-cols-4 mb-4">
            {charts.category_pie && (
              <TabsTrigger value="category" className="flex items-center">
                <PieChart className="h-4 w-4 ml-2" />
                التوزيع
              </TabsTrigger>
            )}
            {charts.time_series && (
              <TabsTrigger value="timeline" className="flex items-center">
                <LineChart className="h-4 w-4 ml-2" />
                المعاملات
              </TabsTrigger>
            )}
            {charts.monthly_expenses && (
              <TabsTrigger value="monthly" className="flex items-center">
                <BarChart className="h-4 w-4 ml-2" />
                الشهرية
              </TabsTrigger>
            )}
            {charts.top_transactions && (
              <TabsTrigger value="top" className="flex items-center">
                <BarChart className="h-4 w-4 ml-2" />
                أكبر المعاملات
              </TabsTrigger>
            )}
          </TabsList>
          
          {charts.category_pie && (
            <TabsContent value="category" className="relative overflow-hidden rounded-lg">
              {!iframeLoaded.category && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="animate-pulse text-muted-foreground">جاري تحميل المخطط...</div>
                </div>
              )}
              <iframe
                src={charts.category_pie}
                className="border-0 w-full h-[400px] overflow-hidden"
                onLoad={() => setIframeLoaded(prev => ({ ...prev, category: true }))}
              />
            </TabsContent>
          )}
          
          {charts.time_series && (
            <TabsContent value="timeline" className="relative overflow-hidden rounded-lg">
              {!iframeLoaded.timeline && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="animate-pulse text-muted-foreground">جاري تحميل المخطط...</div>
                </div>
              )}
              <iframe
                src={charts.time_series}
                className="border-0 w-full h-[400px] overflow-hidden"
                onLoad={() => setIframeLoaded(prev => ({ ...prev, timeline: true }))}
              />
            </TabsContent>
          )}
          
          {charts.monthly_expenses && (
            <TabsContent value="monthly" className="relative overflow-hidden rounded-lg">
              {!iframeLoaded.monthly && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="animate-pulse text-muted-foreground">جاري تحميل المخطط...</div>
                </div>
              )}
              <iframe
                src={charts.monthly_expenses}
                className="border-0 w-full h-[400px] overflow-hidden"
                onLoad={() => setIframeLoaded(prev => ({ ...prev, monthly: true }))}
              />
            </TabsContent>
          )}
          
          {charts.top_transactions && (
            <TabsContent value="top" className="relative overflow-hidden rounded-lg">
              {!iframeLoaded.top && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="animate-pulse text-muted-foreground">جاري تحميل المخطط...</div>
                </div>
              )}
              <iframe
                src={charts.top_transactions}
                className="border-0 w-full h-[400px] overflow-hidden"
                onLoad={() => setIframeLoaded(prev => ({ ...prev, top: true }))}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}