import { useState, useEffect } from 'react';
import { AdminBookingApiService } from '../lib/api/adminBookingApi';
import { BookingApiService } from '../lib/api/bookingApi';
import { Booking } from '../types';
import { transformBookingFromBackend } from '../lib/dataTransformers';

// Hook for fetching all bookings (admin view)
export function useBookings(isAdmin: boolean = false) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    // Only fetch bookings for admin users
    if (!isAdmin) {
      setBookings([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const backendBookings = await AdminBookingApiService.getAllBookings();
      const transformedBookings = backendBookings.map(transformBookingFromBackend);
      setBookings(transformedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAdmin]);

  return { bookings, loading, error, refetch: fetchBookings };
}

// Hook for fetching a single booking by ID
export function useBooking(bookingId: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async () => {
    if (!bookingId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const backendBooking = await AdminBookingApiService.getBookingById(bookingId);
      const transformedBooking = transformBookingFromBackend(backendBooking);
      setBooking(transformedBooking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  return { booking, loading, error, refetch: fetchBooking };
}

// Hook for fetching booking by token (guest view)
export function useBookingByToken(token: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingByToken = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const backendBooking = await BookingApiService.getBookingByReferenceId(token);
      const transformedBooking = transformBookingFromBackend(backendBooking);
      setBooking(transformedBooking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingByToken();
  }, [token]);

  return { booking, loading, error, refetch: fetchBookingByToken };
}