import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuthSession,
  getTenantDomain,
} from "@/lib/auth-storage";
import { ApiErrorResponse } from "@/types/api";

export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://amanixapi-001-site1.ktempurl.com/api/v1";

// Instantiate the global Axios service configuration
export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: RetryQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

function redirectToLogin() {
  if (typeof window === "undefined") return;
  clearAuthSession();
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login?session_expired=true";
  }
}

// Request Interceptor to inject JWT Auth Tokens, Tenant Subdomain, and Language Headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof window !== "undefined") {
      // Injects client preferred response language ('ar' or 'en')
      const lang = document.documentElement.lang || "ar";
      if (!config.headers["Accept-Language"]) {
        config.headers["Accept-Language"] = lang;
      }

      // Injects active tenant subdomain header when present and not already provided
      const tenantDomain = getTenantDomain();
      if (tenantDomain && !config.headers["X-Tenant-Domain"]) {
        config.headers["X-Tenant-Domain"] = tenantDomain;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling unified API errors and silent token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse | ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Format unified error payload
    let formattedError: ApiErrorResponse = {
      isSuccess: false,
      message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      code: "UNKNOWN_ERROR",
    };

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Extract error messages (string[] or record)
      let errorsArray: string[] | undefined = undefined;
      let detailsMap: Record<string, string[]> | undefined = undefined;

      if (Array.isArray(data?.errors)) {
        errorsArray = data.errors;
      } else if (data?.errors && typeof data.errors === "object") {
        detailsMap = data.errors as Record<string, string[]>;
        errorsArray = Object.values(detailsMap).flat();
      }

      const rawMessage =
        data?.message ||
        (errorsArray && errorsArray.length > 0 ? errorsArray[0] : "") ||
        `Request failed with status ${status}`;

      formattedError = {
        isSuccess: false,
        message: rawMessage,
        code: data?.code || String(status),
        errors: errorsArray,
        details: detailsMap || data?.details,
      };

      // Check if the error is 401 Unauthorized and not already retried
      const url = originalRequest?.url || "";
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/refresh-token") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password");

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          // Queue this concurrent request while refreshing is in progress
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();
        const currentAccessToken = getAccessToken();

        if (!refreshToken) {
          isRefreshing = false;
          redirectToLogin();
          return Promise.reject(formattedError);
        }

        try {
          // Silent token rotation call adhering to backend contract
          const refreshResponse = await axios.post(
            `${BASE_API_URL}/auth/refresh-token`,
            {
              accessToken: currentAccessToken || "",
              refreshToken: refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Accept-Language": typeof window !== "undefined" ? document.documentElement.lang || "ar" : "ar",
              },
            }
          );

          const payload = refreshResponse.data?.data || refreshResponse.data;
          const newAccessToken = payload?.accessToken || payload?.token;
          const newRefreshToken = payload?.refreshToken;

          if (!newAccessToken) {
            throw new Error("No token returned from refresh endpoint");
          }

          setTokens(newAccessToken, newRefreshToken || refreshToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          redirectToLogin();
          return Promise.reject(formattedError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle unrecoverable 401 or auth endpoint failures
      if (status === 401 && isAuthEndpoint) {
        return Promise.reject(formattedError);
      }
    } else if (error.request) {
      formattedError = {
        isSuccess: false,
        message: "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.",
        code: "NETWORK_ERROR",
      };
    } else {
      formattedError = {
        isSuccess: false,
        message: error.message || "حدث خطأ أثناء إعداد الطلب.",
        code: "REQUEST_SETUP_ERROR",
      };
    }

    return Promise.reject(formattedError);
  }
);
