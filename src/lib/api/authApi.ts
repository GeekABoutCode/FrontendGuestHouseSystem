import { apiClient } from '../api';

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  lastLogin: string;
}

// Auth API Service
export class AuthApiService {
  // Login user
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Attempting login with credentials:', credentials);
    console.log('Backend URL: https://demo-deployment-latest-5tdw.onrender.com/auth/login');
    
    try {
      // Use direct fetch for auth endpoint since it's not under /api
      const response = await fetch('https://demo-deployment-latest-5tdw.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Login response:', data);
      return data;
    } catch (error) {
      console.error('Login error details:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to backend server. Please ensure your Spring Boot server is running on http://localhost:8080');
      }
      
      throw error;
    }
  }

  // Get current user info (if token is valid)
  static async getCurrentUser(): Promise<{ username: string; email: string; lastLogin: string }> {
    return apiClient.get<{ username: string; email: string; lastLogin: string }>('/auth/me');
  }

  // Logout (clear token)
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Store token and user info
  static setAuthData(token: string, user: { username: string; email: string; lastLogin: string }): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  // Get stored user info
  static getUserInfo(): { username: string; email: string; lastLogin: string } | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
