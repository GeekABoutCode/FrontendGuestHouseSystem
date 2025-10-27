import { apiClient } from '../api';

// Booking Status History API Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

export interface BookingStatusHistoryResponse {
  id: string;
  bookingId: string;
  status: BookingStatus;
  timestamp: string;
  notes?: string;
}

export interface BookingStatusWithTimestampResponse {
  bookingId: string;
  referenceId: string;
  guestName: string;
  propertyName: string;
  status: BookingStatus;
  timestamp: string;
}

// Booking Status History API Service
export class BookingStatusHistoryApiService {
  // Get status history by booking ID
  static async getStatusHistoryByBookingId(bookingId: string): Promise<BookingStatusHistoryResponse[]> {
    return apiClient.get<BookingStatusHistoryResponse[]>(`admin/bookings/${bookingId}/status-history`);
  }

  // Get all status history (optionally filtered by status)
  static async getStatusHistory(status?: BookingStatus): Promise<BookingStatusHistoryResponse[]> {
    const params = status ? `?status=${status}` : '';
    return apiClient.get<BookingStatusHistoryResponse[]>(`admin/bookings/status-history${params}`);
  }

  // Get bookings by current status
  static async getBookingByCurrentStatus(status: BookingStatus): Promise<BookingStatusWithTimestampResponse[]> {
    return apiClient.get<BookingStatusWithTimestampResponse[]>(`admin/bookings/status-history/current?status=${status}`);
  }
}
