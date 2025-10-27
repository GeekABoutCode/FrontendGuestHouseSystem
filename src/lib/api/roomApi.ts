import { apiClient } from '../api';

// Room API Types
export interface RoomCreateRequest {
  propertyId: string;
  roomType: string;
  roomNumber: string;
  description: string;
  pricePerNight: number;
  maxOccupancy: number;
  isAvailable: boolean;
  imageUrl: string;
}

export interface RoomDetails {
  id: string;
  roomType: string;
  roomNumber: string;
  description: string;
  pricePerNight: number;
  maxOccupancy: number;
  isAvailable: boolean;
  propertyId: string;
  imageUrl: string;
  amenities: RoomAmenityDto[];
}

export interface RoomAmenityDto {
  id: string;
  roomId: string;
  amenityDto: {
    id: string;
    name: string;
    description: string;
  };
  isEnabled: boolean;
}

export interface RoomUpdateRequest {
  roomType?: string;
  roomNumber?: string;
  description?: string;
  pricePerNight?: number;
  maxOccupancy?: number;
  isAvailable?: boolean;
  imageUrl?: string;
}

export interface RoomListResponse {
  id: string;
  propertyId: string;
  roomType: string;
  roomNumber: string;
  description: string;
  pricePerNight: number;
  isAvailable: boolean;
  coverPageUrl: string;
}

// Room API Service
export class RoomApiService {
  // Create a new room for a property
  static async createRoom(propertyId: string, roomData: RoomCreateRequest): Promise<RoomDetails> {
    return apiClient.post<RoomDetails>(`/property/${propertyId}/add-new-room`, roomData);
  }

  // Get all rooms for a property
  static async getRoomsByPropertyId(propertyId: string): Promise<RoomListResponse[]> {
    return apiClient.get<RoomListResponse[]>(`/property/${propertyId}/rooms`);
  }

  // Update a room
  static async updateRoom(propertyId: string, roomId: string, updates: RoomUpdateRequest): Promise<RoomDetails> {
    return apiClient.patch<RoomDetails>(`/property/${propertyId}/rooms/${roomId}`, updates);
  }

  // Delete a room
  static async deleteRoom(propertyId: string, roomId: string): Promise<void> {
    return apiClient.delete<void>(`/property/${propertyId}/rooms/${roomId}`);
  }

  // Show room as available
  static async showRoomAvailable(propertyId: string, roomId: string): Promise<RoomDetails> {
    // Send RoomUpdateDto with isAvailable: true
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`https://demo-deployment-latest-5tdw.onrender.com/api/property/${propertyId}/rooms/${roomId}/show-available`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        isAvailable: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  // Toggle room availability
  static async toggleRoomAvailability(propertyId: string, roomId: string, updateData: { available: boolean }): Promise<RoomDetails> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`https://demo-deployment-latest-5tdw.onrender.com/api/property/${propertyId}/rooms/${roomId}/show-available`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        isAvailable: updateData.available
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }
}
