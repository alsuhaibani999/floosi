import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password"> & { rememberMe?: boolean };

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // حفظ خيار تذكرني لاستخدامه في محلي التخزين بعد نجاح تسجيل الدخول
      localStorage.setItem('rememberMe', credentials.rememberMe ? 'true' : 'false');
      
      // إرسال الطلب مع الإعدادات المحدثة لاستقبال JSON مباشرة
      return await apiRequest<SelectUser>("POST", "/api/login", credentials);
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // إذا كان المستخدم قد اختار تذكرني، فسنحفظ اسم المستخدم في التخزين المحلي
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', user.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بعودتك ${user.fullName || user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      return await apiRequest<SelectUser>("POST", "/api/register", credentials);
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      // سننتقل إلى صفحة الإعداد الأولي للمستخدمين الجدد
      window.location.href = "/onboarding";
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في تطبيق فلوسي للتمويل الشخصي الإسلامي",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      
      // إزالة معلومات تذكرني عند تسجيل الخروج إذا لم يكن المستخدم قد طلب تذكره
      if (localStorage.getItem('rememberMe') !== 'true') {
        localStorage.removeItem('rememberedUsername');
      }
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نتمنى أن نراك قريباً",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
