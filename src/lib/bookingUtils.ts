import { Booking } from '../types';

/**
 * Check if two date ranges overlap
 * @param start1 - Start date of first range (YYYY-MM-DD)
 * @param end1 - End date of first range (YYYY-MM-DD)
 * @param start2 - Start date of second range (YYYY-MM-DD)
 * @param end2 - End date of second range (YYYY-MM-DD)
 * @returns true if ranges overlap, false otherwise
 */
export function dateRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Date = new Date(start1 + 'T00:00:00');
  const end1Date = new Date(end1 + 'T00:00:00');
  const start2Date = new Date(start2 + 'T00:00:00');
  const end2Date = new Date(end2 + 'T00:00:00');

  // For hotel bookings:
  // - Check-in dates block the room for that day (inclusive)
  // - Check-out dates also block the room for that day (inclusive)
  // 
  // So if Booking1 is Oct 26-28, the room is occupied on Oct 26 and Oct 28
  // Another guest cannot check in on Oct 28 (the checkout day)
  //
  // To prevent double-booking, we check if:
  // - New booking starts on or before existing booking ends (start1 <= end2)
  // - Existing booking starts on or before new booking ends (start2 <= end1)
  // Using <= means checkout day is NOT available for new checkins
  
  return start1Date.getTime() <= end2Date.getTime() && start2Date.getTime() <= end1Date.getTime();
}

/**
 * Check if a room is available for a given date range
 * @param roomId - ID of the room to check
 * @param propertyId - ID of the property
 * @param checkIn - Check-in date (YYYY-MM-DD)
 * @param checkOut - Check-out date (YYYY-MM-DD)
 * @param existingBookings - Array of existing bookings
 * @param excludeBookingId - Optional booking ID to exclude from check (for updates)
 * @returns true if room is available, false otherwise
 */
export function isRoomAvailable(
  roomId: string,
  propertyId: string,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): boolean {
  // Find all bookings for this room in this property
  // Only consider active bookings (not cancelled or expired)
  const conflictingBookings = existingBookings.filter(booking => 
    booking.propertyId === propertyId &&
    booking.roomIds.includes(roomId) &&
    booking.status !== 'cancelled' &&
    booking.status !== 'expired' &&
    booking.id !== excludeBookingId
  );

  // Check if any existing booking overlaps with the requested dates
  return !conflictingBookings.some(booking => 
    dateRangesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)
  );
}

/**
 * Get all booked dates for a specific room
 * @param roomId - ID of the room
 * @param propertyId - ID of the property
 * @param existingBookings - Array of existing bookings
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getBookedDatesForRoom(
  roomId: string,
  propertyId: string,
  existingBookings: Booking[]
): string[] {
  const roomBookings = existingBookings.filter(booking => 
    booking.propertyId === propertyId &&
    booking.roomIds.includes(roomId) &&
    booking.status !== 'cancelled' &&
    booking.status !== 'expired'
  );

  const bookedDates: string[] = [];
  
  roomBookings.forEach(booking => {
    const startDate = new Date(booking.checkIn);
    const endDate = new Date(booking.checkOut);
    
    // Add all dates from check-in to check-out (inclusive of both dates)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      bookedDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return bookedDates;
}

/**
 * Get all booked dates for a property (across all rooms)
 * @param propertyId - ID of the property
 * @param existingBookings - Array of existing bookings
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getBookedDatesForProperty(
  propertyId: string,
  existingBookings: Booking[]
): string[] {
  const propertyBookings = existingBookings.filter(booking => 
    booking.propertyId === propertyId &&
    booking.status !== 'cancelled' &&
    booking.status !== 'expired'
  );

  const bookedDates: string[] = [];
  
  propertyBookings.forEach(booking => {
    const startDate = new Date(booking.checkIn);
    const endDate = new Date(booking.checkOut);
    
    // Add all dates from check-in to check-out (inclusive of both dates)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      bookedDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return [...new Set(bookedDates)]; // Remove duplicates
}

/**
 * Validate if a booking can be made
 * @param roomIds - Array of room IDs to book
 * @param propertyId - ID of the property
 * @param checkIn - Check-in date (YYYY-MM-DD)
 * @param checkOut - Check-out date (YYYY-MM-DD)
 * @param existingBookings - Array of existing bookings
 * @param excludeBookingId - Optional booking ID to exclude from check (for updates)
 * @returns Object with validation result and conflicting bookings
 */
export function validateBooking(
  roomIds: string[],
  propertyId: string,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): {
  isValid: boolean;
  conflictingBookings: Booking[];
  conflictingRooms: string[];
} {
  const conflictingBookings: Booking[] = [];
  const conflictingRooms: string[] = [];

  // Check each room for conflicts
  roomIds.forEach(roomId => {
    const roomBookings = existingBookings.filter(booking => 
      booking.propertyId === propertyId &&
      booking.roomIds.includes(roomId) &&
      booking.status !== 'cancelled' &&
      booking.status !== 'expired' &&
      booking.id !== excludeBookingId
    );

    const hasConflict = roomBookings.some(booking => 
      dateRangesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)
    );

    if (hasConflict) {
      conflictingRooms.push(roomId);
      conflictingBookings.push(...roomBookings.filter(booking => 
        dateRangesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)
      ));
    }
  });

  return {
    isValid: conflictingRooms.length === 0,
    conflictingBookings: [...new Set(conflictingBookings)], // Remove duplicates
    conflictingRooms
  };
}
