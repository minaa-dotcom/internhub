// Generic API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Error Response
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}