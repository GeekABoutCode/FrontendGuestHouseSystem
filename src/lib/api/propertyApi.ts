import { apiClient } from '../api';

// Property API Types (matching backend DTOs exactly)
export interface PropertyCreateRequest {
  name: string;
  description?: string; // Optional in backend
  location: string;
  city: string;
  country: string;
  isActive: boolean;
  phoneNumber: string;
  totalRooms: number;
  email: string;
  checkInTime: string; // HH:mm format
  checkOutTime: string; // HH:mm format
  coverImageUrl?: string; // Optional in backend
}

export interface PropertyUpdateRequest {
  name?: string;
  description?: string;
  location?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  phoneNumber?: string;
  totalRooms?: number;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
  coverImageUrl?: string;
}

export interface PropertySummary {
  id: string; // UUID from backend
  name: string;
  description?: string;
  location: string;
  city: string;
  country: string;
  isActive: boolean;
  coverImageUrl?: string;
}

export interface RoomDto {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  amenities: string[];
  images: string[];
}

export interface PropertyDetails {
  id: string; // UUID from backend
  name: string;
  description?: string;
  location: string;
  city: string;
  country: string;
  isActive: boolean;
  phoneNumber: string;
  totalRooms: number;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  coverImageUrl?: string;
  photoUrls?: string[];  // all photos for this property
  rooms: RoomDto[];
}

// Property API Service
export class PropertyApiService {
  // Get all properties (returns PropertySummaryDto[])
  static async getAllProperties(): Promise<PropertySummary[]> {
    return apiClient.get<PropertySummary[]>('/property');
  }

  // Get property details by ID (returns PropertyDetailsDto)
  static async getPropertyById(id: string): Promise<PropertyDetails> {
    return apiClient.get<PropertyDetails>(`/property/${id}`);
  }

  // Create new property (uses PropertyCreateDto, returns PropertySummaryDto)
  static async createProperty(property: PropertyCreateRequest): Promise<PropertySummary> {
    return apiClient.post<PropertySummary>('/property', property);
  }

  // Update property (uses PropertyUpdateDto, returns PropertyDetailsDto)
  static async updateProperty(id: string, updates: PropertyUpdateRequest): Promise<PropertyDetails> {
    return apiClient.patch<PropertyDetails>(`/property/${id}`, updates);
  }

  // Delete property
  static async deleteProperty(id: string): Promise<void> {
    return apiClient.delete<void>(`/property/${id}`);
  }
}
