// client/src/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {


  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
        const errorBody = await res.json();
        errorMsg = errorBody.message || JSON.stringify(errorBody) || errorMsg;
    } catch (e) {
        errorMsg = `${errorMsg}: ${res.statusText || 'Unknown Error'}`;
    }
    throw new Error(errorMsg);
  }
  console.log("Response is OK.");
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const headers: HeadersInit = {
    "Accept": "application/json",
  };
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  };

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  if (res.status === 204) {
    return undefined as T;
  }

  try {
    const responseData = await res.json(); // This line *should* run for 200 if not 204
    return responseData as T;
  } catch (e) {
      throw new Error("Received malformed data from the server.");
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options?: {
  on401?: UnauthorizedBehavior;
}) => QueryFunction<T | null> =
  ({ on401: unauthorizedBehavior = "throw" } = {}) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    try {
        const res = await fetch(url, {
          credentials: "include",
          headers: { 'Accept': 'application/json' }
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }

        await throwIfResNotOk(res); // This also calls throwIfResNotOk for queries

        if (res.status === 204) {
            return null;
        }
        const responseData = await res.json(); // This line parses the response for queries
        return responseData;

    } catch (error) {
        throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});