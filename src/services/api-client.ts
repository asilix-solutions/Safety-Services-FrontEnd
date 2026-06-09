import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// Instantiate the global Axios service configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.safety-licensing.com/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to inject JWT Auth Tokens
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Client-side execution check
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("sslm_user_profile");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Assuming token would be present in user profile
          const token = parsed.token || "mock-jwt-token-xyz";
          config.headers.Authorization = `Bearer ${token}`;
        } catch (e) {
          console.error("Error reading token from localStorage", e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for handling unified API errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    let formattedError: ApiErrorResponse = {
      message: "An unexpected error occurred. Please try again later.",
    };

    if (error.response) {
      // Server returned error status code (4xx, 5xx)
      const data = error.response.data;
      formattedError = {
        message: data?.message || `Request failed with status ${error.response.status}`,
        code: data?.code || String(error.response.status),
        details: data?.details,
      };

      // Handle session expiration
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sslm_user_profile");
          // Redirecting to login
          window.location.href = "/login?session_expired=true";
        }
      }
    } else if (error.request) {
      // Request made but no response received
      formattedError = {
        message: "No response received from the server. Check your internet connection.",
        code: "NETWORK_ERROR",
      };
    } else {
      // Something happened in setting up the request
      formattedError = {
        message: error.message,
        code: "REQUEST_SETUP_ERROR",
      };
    }

    return Promise.reject(formattedError);
  }
);
