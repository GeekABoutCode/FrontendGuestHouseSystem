import { Property, Booking, Room } from '../types';
import { PropertyDetails, PropertySummary } from './api/propertyApi';
import { BookingGuestResponse as ApiBookingGuestResponse } from './api/bookingApi';
import { BookingAdminResponse } from './api/adminBookingApi';
import { RoomLineItem } from '../types';

// Property Transformers
export const transformPropertyFromBackend = (backendProperty: PropertySummary): Property => {
  return {
    id: backendProperty.id,
    name: backendProperty.name,
    description: backendProperty.description || '',
    location: backendProperty.location,
    city: backendProperty.city,
    country: backendProperty.country,
    isActive: backendProperty.isActive,
    phoneNumber: '', // Not available in PropertySummary
    totalRooms: 0, // Not available in PropertySummary
    email: '', // Not available in PropertySummary
    checkInTime: '15:00', // Default since not available in PropertySummary
    checkOutTime: '11:00', // Default since not available in PropertySummary
    coverImageUrl: backendProperty.coverImageUrl || '',
    images: [], // Will be populated by separate photo API call
    rating: 4.0, // Default rating since backend doesn't provide it
    pricePerNight: 0, // Will be calculated from rooms
    amenities: [], // Will be populated from rooms or separate API
    rooms: [] // Will be populated from separate API call
  };
};

export const transformPropertyDetailsFromBackend = (backendProperty: PropertyDetails): Property => {
  return {
    id: backendProperty.id,
    name: backendProperty.name,
    description: backendProperty.description || '',
    location: backendProperty.location,
    city: backendProperty.city,
    country: backendProperty.country,
    isActive: backendProperty.isActive,
    phoneNumber: backendProperty.phoneNumber,
    totalRooms: backendProperty.totalRooms,
    email: backendProperty.email,
    checkInTime: backendProperty.checkInTime,
    checkOutTime: backendProperty.checkOutTime,
    coverImageUrl: backendProperty.coverImageUrl || '',
    images: [], // Will be populated by separate photo API call
    rating: 4.0,
    pricePerNight: 0,
    amenities: [],
    rooms: backendProperty.rooms.map(transformRoomFromBackend)
  };
};

export const transformRoomFromBackend = (backendRoom: any): Room => {
  return {
    id: backendRoom.id,
    roomNumber: backendRoom.roomNumber,
    type: backendRoom.type,
    capacity: backendRoom.capacity,
    pricePerNight: backendRoom.pricePerNight,
    isAvailable: backendRoom.isAvailable,
    amenities: backendRoom.amenities || [],
    images: backendRoom.photoUrls && backendRoom.photoUrls.length > 0 
      ? backendRoom.photoUrls 
      : (backendRoom.images || []), // Use existing images as fallback
    // Legacy fields for backward compatibility
    name: backendRoom.roomNumber,
    price: backendRoom.pricePerNight,
    available: backendRoom.isAvailable
  };
};

// Booking Transformers
export const transformBookingFromBackend = (backendBooking: BookingAdminResponse | ApiBookingGuestResponse): Booking => {
  // For admin bookings, always use bookingId (UUID); for guest bookings, use token
  const bookingId = 'bookingId' in backendBooking ? (backendBooking as BookingAdminResponse).bookingId : (backendBooking as ApiBookingGuestResponse).token;
  
  return {
    id: bookingId,
    referenceId: backendBooking.referenceId,
    propertyId: backendBooking.property.id,
    propertyName: backendBooking.property.name,
    roomIds: backendBooking.rooms ? backendBooking.rooms.map((room: any) => 'roomId' in room ? room.roomId : room.id) : [],
    guestName: backendBooking.guestName,
    guestEmail: backendBooking.guestEmail,
    guestPhone: backendBooking.guestPhone,
    checkIn: backendBooking.checkInDate,
    checkOut: backendBooking.checkOutDate,
    guests: backendBooking.noOfGuests,
    selectedAmenities: [], // Not provided by backend
    totalAmount: backendBooking.totalPrice,
    status: backendBooking.status,
    createdAt: backendBooking.createdAt,
    updatedAt: 'updatedAt' in backendBooking ? backendBooking.updatedAt : undefined,
    notes: backendBooking.notes,
    token: backendBooking.token,
    isPaid: 'isPaid' in backendBooking ? backendBooking.isPaid : undefined,
    confirmedAt: backendBooking.confirmedAt,
    expiredAt: 'expiredAt' in backendBooking ? backendBooking.expiredAt : undefined
  };
};

// Request Transformers (Frontend to Backend)
export const transformPropertyToBackend = (frontendProperty: Partial<Property>) => {
  return {
    name: frontendProperty.name,
    description: frontendProperty.description,
    location: frontendProperty.location,
    city: frontendProperty.city || '',
    country: frontendProperty.country || '',
    isActive: frontendProperty.isActive ?? true,
    phoneNumber: frontendProperty.phoneNumber || '',
    totalRooms: frontendProperty.totalRooms || 0,
    email: frontendProperty.email || '',
    checkInTime: frontendProperty.checkInTime || '15:00',
    checkOutTime: frontendProperty.checkOutTime || '11:00',
    coverImageUrl: frontendProperty.coverImageUrl || frontendProperty.images?.[0] || ''
  };
};

export const transformBookingToBackend = (frontendBooking: Partial<Booking>) => {
  return {
    propertyId: frontendBooking.propertyId,
    guestName: frontendBooking.guestName,
    guestEmail: frontendBooking.guestEmail,
    guestPhone: frontendBooking.guestPhone,
    checkInDate: frontendBooking.checkIn,
    checkOutDate: frontendBooking.checkOut,
    noOfRooms: 1, // Default, will be calculated
    noOfGuests: frontendBooking.guests,
    notes: frontendBooking.notes,
    roomIds: frontendBooking.roomIds
  };
};

// Utility functions
export const calculateTotalPrice = (rooms: RoomLineItem[]): number => {
  return rooms.reduce((total, room) => total + room.lineTotal, 0);
};

export const formatDateForBackend = (date: string): string => {
  // Convert from YYYY-MM-DD to backend format if needed
  return date;
};

export const formatTimeForBackend = (time: string): string => {
  // Convert from HH:mm to backend format if needed
  return time;
};
