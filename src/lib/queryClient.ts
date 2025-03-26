import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface ApiRequestOptions {
  isFormData?: boolean;
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: ApiRequestOptions
): Promise<T> {
  const isFormData = options?.isFormData || false;
  
  // إذا كان البيانات هي FormData، لا نحتاج إلى تحديد Content-Type
  // لأن fetch سيقوم بتعيينه تلقائيًا مع boundary المناسب
  const headers: HeadersInit = {};
  if (data && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? (isFormData ? data as FormData : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // إذا كان لدينا محتوى، نقوم بتحويله إلى JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  
  return res as unknown as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
