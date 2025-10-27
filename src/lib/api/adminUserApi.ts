import { apiClient } from '../api';

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  lastLogin?: string;
}

export interface AdminUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface AdminUserUpdateRequest {
  name: string;
  email: string;
  password: string;
}

export interface AdminUserPatchRequest {
  name?: string;
  email?: string;
  password?: string;
}

export class AdminUserApiService {
  static async getAllAdminUsers(): Promise<AdminUserResponse[]> {
    return apiClient.get<AdminUserResponse[]>('/admin-users');
  }

  static async getAdminUserById(id: string): Promise<AdminUserResponse> {
    return apiClient.get<AdminUserResponse>(`/admin-users/${id}`);
  }

  static async createAdminUser(adminData: AdminUserRequest): Promise<AdminUserResponse> {
    return apiClient.post<AdminUserResponse>('/admin-users', adminData);
  }

  static async updateAdminUser(id: string, updateData: AdminUserUpdateRequest): Promise<AdminUserResponse> {
    return apiClient.put<AdminUserResponse>(`/admin-users/${id}`, updateData);
  }

  static async patchAdminUser(id: string, patchData: AdminUserPatchRequest): Promise<AdminUserResponse> {
    return apiClient.patch<AdminUserResponse>(`/admin-users/${id}`, patchData);
  }

  static async deleteAdminUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin-users/${id}`);
  }
}
