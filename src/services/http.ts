import { AxiosRequestConfig } from "axios";
import { apiClient } from "./api-client";
import { ApiResponse } from "@/types/api";

/**
 * Reusable, clean HTTP client abstraction for CRUD operations.
 * Enforces uniform type contracts, clean error propagation,
 * and automatic header injection.
 */
export const http = {
  /**
   * HTTP GET request returning standard ApiResponse envelope.
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  /**
   * HTTP GET request returning unwrapped data payload directly.
   */
  async getData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  },

  /**
   * HTTP POST request returning standard ApiResponse envelope.
   */
  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  /**
   * HTTP POST request returning unwrapped data payload directly.
   */
  async postData<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  },

  /**
   * HTTP PUT request returning standard ApiResponse envelope.
   */
  async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  /**
   * HTTP PUT request returning unwrapped data payload directly.
   */
  async putData<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  },

  /**
   * HTTP PATCH request returning standard ApiResponse envelope.
   */
  async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  /**
   * HTTP DELETE request returning standard ApiResponse envelope.
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  },

  /**
   * HTTP DELETE request returning unwrapped data payload directly.
   */
  async deleteData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  },
};
