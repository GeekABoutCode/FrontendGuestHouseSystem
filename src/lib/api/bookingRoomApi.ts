import { apiClient } from '../api';

// Booking Room API Types
export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  amenities: string[];
  images: string[];
}

export interface BookingRoomResponse {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  amenities: string[];
  images: string[];
}

// Booking Room API Service
export class BookingRoomApiService {
  // Get rooms by booking ID
  static async getRoomsByBookingId(bookingId: string): Promise<Room[]> {
    return apiClient.get<Room[]>(`booking-rooms/${bookingId}`);
  }

  // Map rooms by booking IDs
  static async mapRoomsByBookingIds(bookingIds: string[]): Promise<Record<string, Room[]>> {
    const params = new URLSearchParams();
    bookingIds.forEach(id => params.append('bookingIds', id));
    return apiClient.get<Record<string, Room[]>>(`booking-rooms/map?${params.toString()}`);
  }
}
