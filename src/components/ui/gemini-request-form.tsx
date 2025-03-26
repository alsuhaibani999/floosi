import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface GeminiRequestFormProps {
  onSuccess?: (data: any) => void;
}

export function GeminiRequestForm({ onSuccess }: GeminiRequestFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [bankId, setBankId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();

  const supportedBanks = [
    { id: "alrajhi", name: "مصرف الراجحي" },
    { id: "snb", name: "البنك الأهلي السعودي" },
    { id: "albilad", name: "بنك البلاد" },
    { id: "saib", name: "البنك السعودي للاستثمار" },
    { id: "riyad", name: "بنك الرياض" },
    { id: "sabb", name: "البنك السعودي البريطاني" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type (PDF and Excel)
      const fileType = selectedFile.type;
      if (
        fileType !== "application/pdf" &&
        fileType !== "application/vnd.ms-excel" &&
        fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setError("الرجاء تحميل ملف PDF أو Excel فقط");
        setFile(null);
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("حجم الملف يتجاوز الحد الأقصى (10 ميجابايت)");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      setError("الرجاء اختيار ملف أولاً");
      return;
    }
    
    if (!bankId) {
      setError("الرجاء اختيار البنك");
      return;
    }
    
    setLoading(true);
    setProgress(10);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bankId", bankId);
      
      if (password) {
        formData.append("password", password);
      }
      
      setProgress(30);
      
      const response = await fetch("/api/gemini-analysis", {
        method: "POST",
        body: formData,
      });
      
      setProgress(80);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "فشل في تحليل الملف");
      }
      
      const data = await response.json();
      setProgress(100);
      
      if (!data.success) {
        if (data.passwordRequired) {
          setError("الملف محمي بكلمة مرور. الرجاء إدخال كلمة المرور (مثل رقم الهوية)");
          setLoading(false);
          return;
        } else {
          throw new Error(data.message || data.error || "فشل في تحليل الملف");
        }
      }
      
      toast({
        title: "تم تحليل الملف بنجاح",
        description: `تم استخراج ${data.totalTransactions || 0} معاملة مالية`,
      });
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: any) {
      console.error("Error processing file:", err);
      setError(err.message || "حدث خطأ أثناء معالجة الملف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">تحليل ذكي لكشف الحساب باستخدام Google Gemini</h3>
      <p className="text-muted-foreground mb-6">
        قم بتحميل كشف حسابك البنكي بصيغة PDF أو Excel وسنقوم بتحليله واستخراج المعاملات المالية وإنشاء تقرير تحليلي متكامل
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>حدث خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">البنك</Label>
            <Select value={bankId} onValueChange={setBankId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر البنك" />
              </SelectTrigger>
              <SelectContent>
                {supportedBanks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">كشف الحساب (PDF أو Excel)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.xls,.xlsx"
                className="flex-1"
                disabled={loading}
              />
            </div>
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور (اختياري)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="مثل رقم الهوية إذا كان الملف محميًا"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              مطلوب فقط إذا كان الملف محميًا بكلمة مرور
            </p>
          </div>
          
          {loading && (
            <Progress value={progress} className="h-2 w-full" />
          )}
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري التحليل...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4 ml-2" />
                تحليل كشف الحساب باستخدام Google Gemini
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}