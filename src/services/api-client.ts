import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface ApiErrorResponse {
  isSuccess?: boolean;
  message: string;
  title?: string;
  code?: string;
  errors?: string[] | Record<string, string[]>;
  details?: Record<string, string[]>;
}

export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://amainix-001-site1.ltempurl.com/api/v1";

// Instantiate the global Axios service configuration
export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
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

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const directToken = localStorage.getItem("sslm_access_token");
  if (directToken) return directToken;

  const profileStr = localStorage.getItem("sslm_user_profile_v2") || localStorage.getItem("sslm_user_profile");
  if (profileStr) {
    try {
      const parsed = JSON.parse(profileStr);
      return parsed.token || parsed.accessToken || "mock-jwt-token-xyz";
    } catch {
      return null;
    }
  }
  return null;
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sslm_refresh_token") || "mock-refresh-token-xyz";
}

function setStoredTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sslm_access_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("sslm_refresh_token", refreshToken);
  }
}

function clearSessionAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sslm_access_token");
  localStorage.removeItem("sslm_refresh_token");
  localStorage.removeItem("sslm_user_profile_v2");
  localStorage.removeItem("sslm_user_profile");

  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login?session_expired=true";
  }
}

// Request Interceptor to inject JWT Auth Tokens, Tenant Subdomain, and Language Headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof window !== "undefined") {
      // Injects client preferred response language ('ar' or 'en')
      const lang = document.documentElement.lang || "ar";
      if (!config.headers["Accept-Language"]) {
        config.headers["Accept-Language"] = lang;
      }

      // Injects active tenant subdomain header when present
      const tenantDomain = localStorage.getItem("sslm_tenant_domain");
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
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Format error payload
    let formattedError: ApiErrorResponse = {
      message: "An unexpected error occurred. Please try again later.",
    };

    if (error.response) {
      const data = error.response.data;
      const rawErrors = data?.errors;
      const details =
        data?.details ||
        (rawErrors && typeof rawErrors === "object" && !Array.isArray(rawErrors)
          ? (rawErrors as Record<string, string[]>)
          : undefined);
      const errors = Array.isArray(rawErrors) ? rawErrors : undefined;

      formattedError = {
        message:
          data?.message ||
          data?.title ||
          `Request failed with status ${error.response.status}`,
        code: data?.code || String(error.response.status),
        details,
        errors,
      };

      // Check if the error is 401 Unauthorized and not already retried
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/forgot-password") ||
        originalRequest.url?.includes("/auth/reset-password");

      if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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

        const refreshToken = getStoredRefreshToken();
        if (!refreshToken) {
          isRefreshing = false;
          clearSessionAndRedirect();
          return Promise.reject(formattedError);
        }

        const currentAccessToken = getStoredAccessToken();

        try {
          // Call silent token refresh endpoint adhering to backend contract
          const refreshResponse = await axios.post(
            `${BASE_API_URL}/auth/refresh-token`,
            {
              accessToken: currentAccessToken || "",
              refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Accept-Language": typeof window !== "undefined" ? document.documentElement.lang || "ar" : "ar",
              },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            refreshResponse.data?.data || refreshResponse.data || {};
          const newToken = accessToken || "mock-refreshed-jwt-token";

          setStoredTokens(newToken, newRefreshToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return apiClient(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          clearSessionAndRedirect();
          return Promise.reject(formattedError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle unrecoverable 401 or auth endpoint failures
      if (error.response.status === 401 && isAuthEndpoint) {
        return Promise.reject(formattedError);
      }
    } else if (error.request) {
      formattedError = {
        message: "No response received from the server. Check your internet connection.",
        code: "NETWORK_ERROR",
      };
    } else {
      formattedError = {
        message: error.message,
        code: "REQUEST_SETUP_ERROR",
      };
    }

    return Promise.reject(formattedError);
  }
);

