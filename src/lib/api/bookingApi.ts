import { apiClient } from '../api';

// Booking API Types
export interface BookingCreateRequest {
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string; // YYYY-MM-DD format
  checkOutDate: string; // YYYY-MM-DD format
  noOfRooms: number;
  noOfGuests: number;
  notes?: string;
  roomIds: string[];
  addonIds?: string[]; // Optional addon IDs
}

export interface BookingGuestResponse {
  token: string;
  property: {
    id: string;
    name: string;
    location: string;
  };
  rooms: Array<{
    id: string;
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
  }>;
  referenceId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  noOfRooms: number;
  noOfGuests: number;
  totalPrice: number;
  confirmedAt?: string;
  notes?: string;
}

export interface BookingPatchRequest {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  noOfGuests?: number;
  notes?: string;
}

export interface BookingCancelRequest {
  reason: string;
}

export class BookingApiService {
  /**
   * Create a new booking as a guest
   */
  static async createBooking(bookingData: BookingCreateRequest): Promise<BookingGuestResponse> {
    return apiClient.post<BookingGuestResponse>('/bookings/guest/create', bookingData);
  }

  /**
   * Get booking details by reference ID (not token)
   */
  static async getBookingByReferenceId(referenceId: string): Promise<BookingGuestResponse> {
    return apiClient.get<BookingGuestResponse>(`/bookings/guest/${referenceId}`);
  }

  /**
   * Update booking details (patch)
   */
  static async updateBooking(referenceId: string, updateData: BookingPatchRequest): Promise<BookingGuestResponse> {
    return apiClient.patch<BookingGuestResponse>(`/bookings/guest/${referenceId}/patch`, updateData);
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string, cancelData: BookingCancelRequest): Promise<BookingGuestResponse> {
    return apiClient.post<BookingGuestResponse>(`/bookings/guest/${bookingId}/cancel`, cancelData);
  }
}