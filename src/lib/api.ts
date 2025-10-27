// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://demo-deployment-latest-5tdw.onrender.com/api';

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    const defaultHeaders: Record<string, string> = {};

    // Add Bearer token if available
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('🌐 API Request:', { url, method: options.method || 'GET', headers: config.headers });
      const response = await fetch(url, config);
      console.log('🌐 API Response:', { status: response.status, statusText: response.statusText, url });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let responseText = '';
        
        try {
          responseText = await response.text();
          console.error('Raw backend error response:', responseText);
          
          // Try to parse as JSON
          const errorData = JSON.parse(responseText);
          console.error('Parsed backend error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          // If it's not JSON, use the raw text as error message
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses (like DELETE operations)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        // For array endpoints, return empty array instead of empty object
        if (endpoint.includes('/addons') || endpoint.includes('/properties') || endpoint.includes('/bookings')) {
          return [] as T;
        }
        return {} as T;
      }

      const data = await response.json();
      console.log('🌐 API Response Data:', data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// API Error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API errors
export const handleApiError = (error: any): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (error.message) {
    throw new ApiError(error.message);
  }
  
  throw new ApiError('An unexpected error occurred');
};
