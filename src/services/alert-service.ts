import { toast } from "sonner";
import { ApiResponse, ApiErrorResponse } from "@/types/api";

export interface AlertOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
}

/**
 * Unified, enterprise Alert and Notification Service.
 * Centralizes UI feedback across the entire application using modern Sonner toasts,
 * with full RTL support, automatic error unwrapping, validation list formatting,
 * and subscription/quota warning hooks.
 */
export const alertService = {
  /**
   * Display a success toast.
   */
  success(message: string, options?: AlertOptions) {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Display an error toast with optional description or details.
   */
  error(message: string, options?: AlertOptions) {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Display a warning toast.
   */
  warning(message: string, options?: AlertOptions) {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Display an informational toast.
   */
  info(message: string, options?: AlertOptions) {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  /**
   * Display a persistent loading toast.
   */
  loading(message: string) {
    return toast.loading(message);
  },

  /**
   * Dismiss an active toast by id.
   */
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  /**
   * Automatically process and present an ApiResponse envelope.
   * Renders success if isSuccess=true, or error with parsed errors if false.
   */
  showApiResponse<T>(
    response: ApiResponse<T>,
    options?: {
      defaultSuccess?: string;
      defaultError?: string;
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) {
    if (response.isSuccess || response.success) {
      const msg = response.message || options?.defaultSuccess || "تمت العملية بنجاح";
      toast.success(msg);
      options?.onSuccess?.();
      return true;
    } else {
      const errors = response.errors;
      const errorMsg =
        response.message ||
        (errors && errors.length > 0 ? errors[0] : options?.defaultError) ||
        "تعذر إتمام العملية";

      let description: string | undefined = undefined;
      if (errors && errors.length > 1) {
        description = errors.slice(1).join(" • ");
      }

      toast.error(errorMsg, {
        description,
        duration: 6000,
      });
      options?.onError?.();
      return false;
    }
  },

  /**
   * Unified error handler for caught HTTP exceptions, Axios errors, or ApiErrorResponse.
   */
  showApiError(
    error: unknown,
    options?: {
      fallbackMessage?: string;
      action?: AlertOptions["action"];
    }
  ) {
    let mainMessage = options?.fallbackMessage || "حدث خطأ أثناء معالجة الطلب";
    let description: string | undefined = undefined;

    if (typeof error === "string") {
      mainMessage = error;
    } else if (error && typeof error === "object") {
      const err = error as Partial<ApiErrorResponse> & {
        response?: { data?: ApiResponse | ApiErrorResponse; status?: number };
      };

      // Check if it's an HTTP 402 Subscription payment/quota refusal
      const statusCode = err.code || String(err.response?.status || "");
      if (statusCode === "402") {
        const quotaError =
          (Array.isArray(err.errors) ? err.errors[0] : undefined) ||
          err.message ||
          "تم تجاوز حد الحصة أو انتهاء صلاحية اشتراك المؤسسة. يرجى مراجعة تفاصيل الباقة.";

        return toast.warning("تنبيه الاشتراك والحصص", {
          description: quotaError,
          duration: 8000,
          action: options?.action || {
            label: "تفاصيل الباقة",
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = "/settings";
              }
            },
          },
        });
      }

      // Check for backend errors array
      const rawErrors = err.errors || (err.response?.data as ApiResponse)?.errors;
      if (Array.isArray(rawErrors) && rawErrors.length > 0) {
        mainMessage = rawErrors[0];
        if (rawErrors.length > 1) {
          description = rawErrors.slice(1).join(" • ");
        }
      } else if (err.message) {
        mainMessage = err.message;
      } else if (err.response?.data?.message) {
        mainMessage = err.response.data.message;
      }
    }

    return toast.error(mainMessage, {
      description,
      duration: 6000,
      action: options?.action,
    });
  },

  /**
   * Wrap an async promise with animated loading, success, and error toasts.
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) {
    return toast.promise(promise, messages);
  },

  showSuccess(message: string, description?: string) {
    return this.success(message, description ? { description } : undefined);
  },

  showError(message: string, description?: string) {
    return this.error(message, description ? { description } : undefined);
  },

  showWarning(message: string, description?: string) {
    return this.warning(message, description ? { description } : undefined);
  },
};
