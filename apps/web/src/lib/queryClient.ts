import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiUrl } from "./api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = localStorage.getItem("living-rewards.demo-token");
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    // Ignore localStorage errors in restricted browser contexts.
  }
  return { "X-Demo-Mode": "true" };
}

export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(await getAuthHeaders())
  };
  if (data) headers["Content-Type"] = "application/json";

  const res = await fetch(apiUrl(url), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include"
  });
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const key = queryKey.join("/") as string;
    const url = apiUrl(key.startsWith("/api") ? key : `/api${key.startsWith("/") ? "" : "/"}${key}`);
    const res = await fetch(url, { headers: await getAuthHeaders(), credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false
    },
    mutations: {
      retry: false
    }
  }
});
