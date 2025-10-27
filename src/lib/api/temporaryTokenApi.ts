import { apiClient } from '../api';

// Temporary Token API Types
export interface TemporaryToken {
  id: string;
  token: string;
  bookingId: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface TemporaryTokenRequest {
  bookingId: string;
  newExpiresAt: string;
}

export interface TemporaryTokenResponse {
  id: string;
  token: string;
  bookingId: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

// Temporary Token API Service
export class TemporaryTokenApiService {
  // Get token if valid
  static async getTokenIfValid(token: string): Promise<TemporaryToken> {
    return apiClient.get<TemporaryToken>(`admin/temporary-token/by-token/${token}`);
  }

  // Get token by booking ID
  static async getTokenByBookingId(bookingId: string): Promise<TemporaryToken> {
    return apiClient.get<TemporaryToken>(`admin/temporary-token/by-booking/${bookingId}`);
  }

  // Get all tokens
  static async getAllTokens(): Promise<Record<string, TemporaryTokenResponse[]>> {
    return apiClient.get<Record<string, TemporaryTokenResponse[]>>('admin/temporary-token/all-tokens');
  }

  // Deactivate token by booking ID
  static async deactivateTokenByBookingId(bookingId: string): Promise<string> {
    return apiClient.patch<string>(`admin/temporary-token/${bookingId}/deactivate`);
  }

  // Deactivate all tokens
  static async deactivateAllTokens(): Promise<string> {
    return apiClient.patch<string>('admin/temporary-token/deactivate-all');
  }

  // Regenerate token
  static async regenerateToken(request: TemporaryTokenRequest): Promise<string> {
    return apiClient.post<string>('admin/temporary-token/regenerate', request);
  }
}
