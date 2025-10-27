import { apiClient } from '../api';

// Room Amenity API Types
export interface RoomAmenityRequest {
  roomId: string;
  amenityId: string;
  isEnabled: boolean;
}

export interface RoomAmenityResponse {
  id: string;
  roomId: string;
  amenityDto: {
    id: string;
    name: string;
    description: string;
  };
  isEnabled: boolean;
}

// Room Amenity API Service
export class RoomAmenityApiService {
  // Assign amenity to room
  static async assignAmenityToRoom(roomId: string, amenityId: string): Promise<RoomAmenityResponse> {
    return apiClient.post<RoomAmenityResponse>('/room-amenities', {
      roomId,
      amenityId,
      isEnabled: true
    });
  }

  // Remove amenity from room
  static async removeAmenityFromRoom(roomId: string, amenityId: string): Promise<void> {
    return apiClient.delete<void>(`/room-amenities/${roomId}/${amenityId}`);
  }

  // Update room amenity status
  static async updateRoomAmenity(roomId: string, amenityId: string, isEnabled: boolean): Promise<RoomAmenityResponse> {
    return apiClient.patch<RoomAmenityResponse>(`/room-amenities/${roomId}/${amenityId}`, {
      isEnabled
    });
  }

  // Get all amenities for a room
  static async getRoomAmenities(roomId: string): Promise<RoomAmenityResponse[]> {
    return apiClient.get<RoomAmenityResponse[]>(`/room-amenities/room/${roomId}`);
  }
}
