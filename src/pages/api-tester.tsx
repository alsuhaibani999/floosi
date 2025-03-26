import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileText, AlertCircle, CheckCircle2, ArrowUpIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const API_ENDPOINTS = [
  { value: 'upload-statement', label: 'تحليل عادي', description: '/api/upload-statement' },
  { value: 'upload-statement-ai', label: 'تحليل ذكي', description: '/api/upload-statement-ai' },
  { value: 'upload-statement-enhanced', label: 'تحليل محسن', description: '/api/upload-statement-enhanced' },
  { value: 'parse-statement-config', label: 'تحليل مع التكوين', description: '/api/parse-statement-config' },
  { value: 'gemini-analysis', label: 'تحليل جيميناي', description: '/api/gemini-analysis' },
  { value: 'gemini-pydantic-analysis', label: 'تحليل بايدانتيك', description: '/api/gemini-pydantic-analysis' },
  { value: 'alrajhi-fix', label: 'إصلاح كشف الراجحي', description: '/api/alrajhi-fix' }
];

const ApiTesterPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('upload-statement');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [bankId, setBankId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestStartTime, setRequestStartTime] = useState(0);
  const [requestTime, setRequestTime] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('الرجاء اختيار ملف أولا');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setRequestStartTime(Date.now());

    const formData = new FormData();
    formData.append('file', file);
    
    if (password) {
      formData.append('password', password);
    }
    
    if (bankId) {
      formData.append('bankId', bankId);
    }

    try {
      const result = await fetch(`/api/${selectedEndpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const responseTime = Date.now() - requestStartTime;
      setRequestTime(responseTime);

      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`فشل الطلب: ${result.status} - ${errorText}`);
      }

      const data = await result.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            جاري تحليل الملف... قد تستغرق العملية بضع دقائق
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>حدث خطأ</AlertTitle>
          <AlertDescription dir="rtl" className="font-mono text-sm whitespace-pre-wrap">
            {error}
          </AlertDescription>
        </Alert>
      );
    }

    if (response) {
      return (
        <div className="mt-4">
          <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              <div className="text-green-700 font-medium">تم تحليل الملف بنجاح</div>
            </div>
            <div className="text-green-600 mt-1 text-sm">
              استغرقت العملية {requestTime / 1000} ثوانٍ
            </div>
          </div>
          
          <Textarea
            value={JSON.stringify(response, null, 2)}
            className="font-mono text-sm h-[500px] overflow-auto bg-slate-50"
            readOnly
          />
        </div>
      );
    }

    return null;
  };

  return (
    <AppShell>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">اختبار واجهات البرمجة</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>الواجهات المتاحة</CardTitle>
                <CardDescription>
                  اختر واجهة برمجة لاختبارها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  {API_ENDPOINTS.map((endpoint) => (
                    <Button 
                      key={endpoint.value}
                      variant={selectedEndpoint === endpoint.value ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedEndpoint(endpoint.value)}
                    >
                      <span className="truncate">{endpoint.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto rtl:mr-auto rtl:ml-0">
                        {endpoint.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>إرسال طلب</CardTitle>
                <CardDescription>
                  {API_ENDPOINTS.find(e => e.value === selectedEndpoint)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">اختر ملف كشف الحساب</Label>
                    <div className="flex items-center">
                      <Input 
                        id="file" 
                        type="file" 
                        onChange={handleFileChange}
                        className="flex-1"
                        accept=".pdf,.xlsx,.xls,.csv"
                      />
                      {file && (
                        <div className="ml-2 flex items-center text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 mr-1" />
                          <span className="truncate max-w-[200px]">{file.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور (اختياري)</Label>
                      <Input 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="مثال: رقم الهوية أو رقم الحساب"
                      />
                      <p className="text-xs text-muted-foreground">
                        لملفات PDF المحمية بكلمة مرور
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankId">معرف البنك (اختياري)</Label>
                      <Input 
                        id="bankId" 
                        value={bankId}
                        onChange={(e) => setBankId(e.target.value)}
                        placeholder="مثال: alrajhi, alahli"
                      />
                      <p className="text-xs text-muted-foreground">
                        يساعد في دقة التحليل عند معرفة البنك مسبقًا
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || !file}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <ArrowUpIcon className="h-4 w-4 mr-2" />
                        إرسال الطلب
                      </>
                    )}
                  </Button>
                </form>

                {renderResponse()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ApiTesterPage;