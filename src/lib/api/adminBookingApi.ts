import { apiClient } from '../api';

// Admin Booking API Types
export interface BookingAdminResponse {
  bookingId: string;
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
  updatedAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  noOfRooms: number;
  noOfGuests: number;
  totalPrice: number;
  isPaid: boolean;
  confirmedAt?: string;
  expiredAt?: string;
  notes?: string;
  token: string;
}

export interface BookingCancelRequest {
  reason: string;
}

export class AdminBookingApiService {
  /**
   * Create a new booking as admin
   */
  static async createBooking(bookingData: {
    propertyId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkInDate: string;
    checkOutDate: string;
    noOfRooms: number;
    noOfGuests: number;
    notes?: string;
    roomIds: string[];
    addonIds?: string[];
  }): Promise<BookingAdminResponse> {
    return apiClient.post<BookingAdminResponse>('/bookings/admin/create', bookingData);
  }

  /**
   * Confirm a booking (admin only)
   */
  static async confirmBooking(bookingId: string): Promise<BookingAdminResponse> {
    return apiClient.post<BookingAdminResponse>(`/bookings/admin/${bookingId}/confirm`);
  }

  /**
   * Cancel a booking (admin only)
   */
  static async cancelBooking(bookingId: string, cancelData: BookingCancelRequest): Promise<BookingAdminResponse> {
    return apiClient.post<BookingAdminResponse>(`/bookings/admin/${bookingId}/cancel`, cancelData);
  }

  /**
   * Update a booking (admin only)
   */
  static async updateBooking(bookingId: string, updateData: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkInDate: string;
    checkOutDate: string;
    noOfRooms: number;
    noOfGuests: number;
    notes?: string;
    roomIds: string[];
    addonIds?: string[];
  }): Promise<BookingAdminResponse> {
    return apiClient.put<BookingAdminResponse>(`/bookings/admin/${bookingId}/update`, updateData);
  }

  /**
   * Get all bookings (admin only)
   */
  static async getAllBookings(): Promise<BookingAdminResponse[]> {
    return apiClient.get<BookingAdminResponse[]>('/bookings/admin/get-all');
  }

  /**
   * Get booking by ID (admin only)
   */
  static async getBookingById(bookingId: string): Promise<BookingAdminResponse> {
    return apiClient.get<BookingAdminResponse>(`/bookings/admin/${bookingId}`);
  }
}
