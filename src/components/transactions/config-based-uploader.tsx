import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, AlertCircle, FileText, Check, KeyRound, Lock, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface SupportedBank {
  id: string;
  name: string;
  nameEn?: string;
}

interface PasswordHint {
  type: 'national_id' | 'dob' | 'account_number' | 'phone' | 'custom' | string;
  message: string;
}

interface ConfigBasedUploaderProps {
  onUploadSuccess: (data: any) => void;
  className?: string;
}

export default function ConfigBasedUploader({ onUploadSuccess, className }: ConfigBasedUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordHints, setPasswordHints] = useState<PasswordHint[]>([]);
  const [passwordBankId, setPasswordBankId] = useState<string | null>(null);
  const [passwordBankName, setPasswordBankName] = useState<string | null>(null);

  // استعلام للحصول على قائمة البنوك المدعومة
  const { data: supportedBanks, isLoading: banksLoading } = useQuery<SupportedBank[]>({
    queryKey: ['/api/supported-banks'],
    retry: 1,
    staleTime: 1000 * 60 * 60 // ساعة واحدة
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // التحقق من نوع الملف
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.ms-excel' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'text/csv') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('يرجى تحميل ملف PDF أو Excel أو CSV فقط');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('يرجى اختيار ملف أولاً');
      return;
    }
    
    setUploading(true);
    setProgress(10);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // إضافة معرف البنك إلى الطلب إذا تم اختياره
      if (selectedBankId) {
        formData.append('bankId', selectedBankId);
      }
      
      // إضافة كلمة المرور للملفات المحمية
      if (passwordRequired && password) {
        formData.append('password', password);
        
        // استخدام معرف البنك من الاستجابة السابقة إذا كان متاحًا
        if (passwordBankId && !selectedBankId) {
          formData.append('bankId', passwordBankId);
        }
      }
      
      setProgress(30);
      
      const response = await apiRequest('POST', '/api/parse-statement-config', formData, { isFormData: true });
      setProgress(90);
      
      const data = await response.json();
      setProgress(100);
      
      // التحقق ما إذا كان الملف يتطلب كلمة مرور
      if (!data.success && data.passwordRequired) {
        console.log('الملف يتطلب كلمة مرور، إظهار نموذج كلمة المرور');
        setPasswordRequired(true);
        setPasswordHints(data.passwordHints || []);
        
        // حفظ معلومات البنك للاستخدام اللاحق
        if (data.bankId) setPasswordBankId(data.bankId);
        if (data.bankName) setPasswordBankName(data.bankName);

        // عرض رسالة مخصصة حسب نوع كلمة المرور المطلوبة
        const isNationalIdRequired = data.requiresNationalId === true || 
                                    data.passwordHints?.some((hint: any) => hint.type === 'national_id');
        
        toast({
          title: isNationalIdRequired ? "كشف حساب محمي برقم الهوية" : "كشف حساب محمي",
          description: data.message || (isNationalIdRequired 
            ? "الملف محمي برقم الهوية الوطنية. يرجى إدخال رقم الهوية المكون من 10 أرقام." 
            : "الملف محمي بكلمة مرور. يرجى إدخال كلمة المرور المناسبة."),
          variant: "destructive",
        });
        
        setUploading(false);
        return;
      }
      
      if (!data.success && data.message) {
        throw new Error(data.message);
      }
      
      // إعادة تعيين حالة كلمة المرور إذا نجحت العملية
      setPasswordRequired(false);
      setPassword("");
      setPasswordHints([]);
      setPasswordBankId(null);
      setPasswordBankName(null);
      
      toast({
        title: "تم تحليل كشف الحساب بنجاح",
        description: `تم استخراج ${data.totalTransactions || 0} معاملة`,
      });
      
      onUploadSuccess(data);
    } catch (err: any) {
      console.error('خطأ في تحليل الملف:', err);
      setError(err.message || 'حدث خطأ أثناء تحليل الملف');
      
      toast({
        variant: "destructive",
        title: "فشل تحليل كشف الحساب",
        description: err.message || 'حدث خطأ أثناء تحليل الملف',
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleBankChange = (value: string) => {
    // في حالة اختيار "auto"، نعيد ضبط القيمة لتكون فارغة لأن الخادم يتوقع قيمة فارغة للاكتشاف التلقائي
    setSelectedBankId(value === "auto" ? "" : value);
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 cursor-pointer
            ${selectedFile ? 'border-primary bg-slate-50 dark:bg-slate-900' : 'border-muted-foreground/25'}
            ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : ''}
          `}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.xls,.xlsx,.csv"
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <div className="font-medium">اسحب وأفلت أو انقر لتحميل كشف حساب</div>
              <div className="text-xs text-muted-foreground">
                فقط ملفات PDF و Excel و CSV
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-right mb-1 text-sm font-medium">
          اختيار البنك (اختياري)
        </div>
        
        <Select value={selectedBankId} onValueChange={handleBankChange}>
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="اختر بنكك (اختياري)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">تلقائي (التعرف على البنك من الملف)</SelectItem>
            {banksLoading ? (
              <SelectItem value="loading" disabled>جاري تحميل البنوك...</SelectItem>
            ) : (
              supportedBanks?.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {passwordRequired && (
          <div className="mb-4">
            <Alert className="mb-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-500 font-semibold text-right">
                {passwordBankName ? `كشف حساب ${passwordBankName} محمي` : 'كشف الحساب محمي'}
              </AlertTitle>
              <AlertDescription className="text-right">
                {passwordHints.length > 0 ? (
                  <div>
                    {passwordHints.map((hint, index) => {
                      // إضافة أيقونة مناسبة حسب نوع كلمة المرور المطلوبة
                      let icon = null;
                      if (hint.type === 'national_id') {
                        icon = <span className="inline-flex items-center text-amber-600 ml-1">🪪</span>;
                      } else if (hint.type === 'dob') {
                        icon = <span className="inline-flex items-center text-amber-600 ml-1">📅</span>;
                      } else if (hint.type === 'account_number') {
                        icon = <span className="inline-flex items-center text-amber-600 ml-1">💳</span>;
                      } else if (hint.type === 'phone') {
                        icon = <span className="inline-flex items-center text-amber-600 ml-1">📱</span>;
                      }
                      
                      return (
                        <p key={index} className="text-sm mt-1 flex items-center justify-end">
                          <span>{hint.message}</span>
                          {icon}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm">يرجى إدخال كلمة المرور لفتح الملف المحمي</p>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">
                {passwordHints.some(hint => hint.type === 'national_id') 
                  ? "رقم الهوية الوطنية (١٠ أرقام)" 
                  : "كلمة المرور / رقم الهوية الوطنية"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={passwordHints.some(hint => hint.type === 'national_id') ? "tel" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className="pl-10 text-right"
                  placeholder={passwordHints.some(hint => hint.type === 'national_id') 
                    ? "أدخل رقم الهوية الوطنية المكون من ١٠ أرقام" 
                    : "أدخل كلمة المرور لفتح الملف"}
                  autoFocus
                  inputMode={passwordHints.some(hint => hint.type === 'national_id') ? "numeric" : "text"}
                  pattern={passwordHints.some(hint => hint.type === 'national_id') ? "[0-9]*" : undefined}
                  maxLength={passwordHints.some(hint => hint.type === 'national_id') ? 10 : undefined}
                />
                {passwordHints.some(hint => hint.type === 'national_id') 
                  ? <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground">🪪</span>
                  : <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
              </div>
            </div>
          </div>
        )}
        
        {uploading && (
          <Progress value={progress} className="mb-4" />
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={(!selectedFile || uploading) || (passwordRequired && !password)}
            className="w-full md:w-auto"
          >
            {uploading ? (
              <>جاري التحليل...</>
            ) : progress === 100 ? (
              <><Check className="mr-2 h-4 w-4" /> تم التحليل</>
            ) : passwordRequired ? (
              <><Lock className="mr-2 h-4 w-4" /> فتح وتحليل الملف</>
            ) : (
              <>تحليل كشف الحساب</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}