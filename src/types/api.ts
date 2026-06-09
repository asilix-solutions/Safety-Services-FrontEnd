export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    totalItems?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
