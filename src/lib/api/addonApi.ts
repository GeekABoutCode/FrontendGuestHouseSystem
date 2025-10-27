import { apiClient } from '../api';

export interface AddonResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddonRequest {
  name: string;
  description?: string;
  price: number;
  active?: boolean;
}

export class AddonApiService {
  /**
   * Create a new addon
   */
  static async createAddon(addonData: AddonRequest): Promise<AddonResponse> {
    return apiClient.post<AddonResponse>('/addons', addonData);
  }

  /**
   * Get all addons
   */
  static async getAllAddons(): Promise<AddonResponse[]> {
    return apiClient.get<AddonResponse[]>('/addons');
  }

  /**
   * Get active addons only
   */
  static async getActiveAddons(): Promise<AddonResponse[]> {
    return apiClient.get<AddonResponse[]>('/addons/active');
  }

  /**
   * Get addon by ID
   */
  static async getAddonById(id: string): Promise<AddonResponse> {
    return apiClient.get<AddonResponse>(`/addons/${id}`);
  }

  /**
   * Get addon by name
   */
  static async getAddonByName(name: string): Promise<AddonResponse> {
    return apiClient.get<AddonResponse>(`/addons/name/${name}`);
  }

  /**
   * Search addons by keyword
   */
  static async searchAddons(keyword: string): Promise<AddonResponse[]> {
    return apiClient.get<AddonResponse[]>(`/addons/search?keyword=${encodeURIComponent(keyword)}`);
  }

  /**
   * Search active addons by keyword
   */
  static async searchActiveAddons(keyword: string): Promise<AddonResponse[]> {
    return apiClient.get<AddonResponse[]>(`/addons/search/active?keyword=${encodeURIComponent(keyword)}`);
  }

  /**
   * Update an existing addon
   */
  static async updateAddon(id: string, addonData: AddonRequest): Promise<AddonResponse> {
    return apiClient.put<AddonResponse>(`/addons/${id}`, addonData);
  }

  /**
   * Activate an addon
   */
  static async activateAddon(id: string): Promise<AddonResponse> {
    return apiClient.patch<AddonResponse>(`/addons/${id}/activate`);
  }

  /**
   * Deactivate an addon
   */
  static async deactivateAddon(id: string): Promise<AddonResponse> {
    return apiClient.patch<AddonResponse>(`/addons/${id}/deactivate`);
  }

  /**
   * Hard delete an addon (permanent deletion)
   */
  static async deleteAddon(id: string): Promise<void> {
    return apiClient.delete(`/addons/${id}/hard`);
  }
}
