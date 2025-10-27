import { apiClient } from '../api';

// Amenity API Types
export interface AmenityRequest {
  name: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export interface AmenityResponse {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
}

// Amenity API Service
export class AmenityApiService {
  // Create a new amenity
  static async createAmenity(amenityData: AmenityRequest): Promise<AmenityResponse> {
    return apiClient.post<AmenityResponse>('/amenities', amenityData);
  }

  // Get all amenities
  static async getAllAmenities(): Promise<AmenityResponse[]> {
    return apiClient.get<AmenityResponse[]>('/amenities');
  }

  // Delete an amenity
  static async deleteAmenity(amenityId: string): Promise<void> {
    return apiClient.delete<void>(`/amenities/${amenityId}`);
  }
}
