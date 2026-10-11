/**
 * Unified Backend API Response envelope matching Amanix .NET 10 Clean Architecture.
 * Contract: { isSuccess: boolean, message: string, data: T, errors: string[] }
 */
export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  /** Backward compatibility alias */
  success?: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  meta?: {
    totalItems?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  isSuccess?: boolean;
  success?: boolean;
  message: string;
  code?: string;
  errors?: string[] | Record<string, string[]>;
  details?: Record<string, string[]>;
  timestamp?: string;
}
