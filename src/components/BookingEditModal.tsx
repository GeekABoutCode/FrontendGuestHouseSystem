import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Plus, Minus, AlertCircle, Save } from 'lucide-react';
import { Property, Room, Booking } from '../types';
import { useApp } from '../context/AppContextWithApi';
import { availableAmenities } from '../data/mockData';
import { validateBooking, isRoomAvailable } from '../lib/bookingUtils';
import BookingCalendar from './BookingCalendar';

interface BookingEditModalProps {
  booking: Booking;
  property: Property;
  isAdmin: boolean;
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
}

export default function BookingEditModal({ 
  booking, 
  property, 
  isAdmin, 
  onClose, 
  onSave 
}: BookingEditModalProps) {
  const { state } = useApp();

  // Safety check for property
  if (!property) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Not Found</h2>
            <p className="text-gray-600 mb-6">The property for this booking could not be found.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [checkIn, setCheckIn] = useState(booking.checkIn);
  const [checkOut, setCheckOut] = useState(booking.checkOut);
  const [guests, setGuests] = useState(booking.guests);
  const [guestName, setGuestName] = useState(booking.guestName);
  const [guestEmail, setGuestEmail] = useState(booking.guestEmail);
  const [guestPhone, setGuestPhone] = useState(booking.guestPhone);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(booking.selectedAmenities);
  const [notes, setNotes] = useState(booking.notes || '');
  const [status, setStatus] = useState(booking.status);
  const [totalAmount, setTotalAmount] = useState(booking.totalAmount);
  const [bookingError, setBookingError] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset all form state when booking changes
  useEffect(() => {
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setGuests(booking.guests);
    setGuestName(booking.guestName);
    setGuestEmail(booking.guestEmail);
    setGuestPhone(booking.guestPhone);
    setSelectedAmenities(booking.selectedAmenities);
    setNotes(booking.notes || '');
    setStatus(booking.status);
    setTotalAmount(booking.totalAmount);
    setBookingError('');
    setIsSaving(false);
  }, [booking.id]); // Reset when booking ID changes

  // Initialize selected rooms from booking
  useEffect(() => {
    if (property && property.rooms && property.rooms.length > 0) {
      console.log('🏠 Initializing selected rooms:', booking.roomIds);
      console.log('🏠 Available property rooms:', property.rooms.map(r => ({ id: r.id, roomNumber: r.roomNumber, name: r.name })));
      
      // Since booking.roomIds now contains roomIds (from RoomLineItemDto), match by roomId
      const validRoomIds = booking.roomIds.filter(roomId => roomId !== undefined && roomId !== null);
      console.log('🏠 Valid room IDs from booking:', validRoomIds);
      
      if (validRoomIds.length > 0) {
        // Match by roomId since booking.roomIds contains roomIds
        const rooms = property.rooms.filter(room => validRoomIds.includes(room.id));
        console.log('🏠 Matched rooms:', rooms.map(r => ({ id: r.id, roomNumber: r.roomNumber, name: r.name })));
        
        if (rooms.length > 0) {
          setSelectedRooms(rooms);
        } else {
          console.warn('🏠 No matching rooms found! Booking room IDs:', validRoomIds, 'Property room IDs:', property.rooms.map(r => r.id));
          // If no rooms match, try to find rooms by roomNumber as fallback
          const roomsByNumber = property.rooms.filter(room => 
            booking.roomIds.some(roomId => room.roomNumber === roomId || room.name === roomId)
          );
          if (roomsByNumber.length > 0) {
            console.log('🏠 Found rooms by roomNumber fallback:', roomsByNumber);
            setSelectedRooms(roomsByNumber);
          } else {
            setSelectedRooms([]);
          }
        }
      } else {
        console.warn('🏠 No valid room IDs found in booking.roomIds:', booking.roomIds);
        setSelectedRooms([]);
      }
    } else {
      console.warn('🏠 Property or rooms not available:', { 
        hasProperty: !!property, 
        hasRooms: property?.rooms?.length > 0,
        roomsCount: property?.rooms?.length || 0
      });
    }
  }, [property?.rooms, booking.roomIds, booking.id]);

  // Filter rooms based on availability and booking conflicts
  const getAvailableRooms = () => {
    if (!property || !property.rooms) {
      return [];
    }
    
    return property.rooms.filter(room => {
      if (!room.available) return false;
      
      // If dates are selected, check for booking conflicts (excluding current booking)
      if (checkIn && checkOut) {
        return isRoomAvailable(room.id, property.id, checkIn, checkOut, 
          state.bookings.filter(b => b.id !== booking.id));
      }
      
      return true;
    });
  };

  const availableRooms = useMemo(() => getAvailableRooms(), [property, checkIn, checkOut, state.bookings]);

  // Update selected rooms when available rooms change
  useEffect(() => {
    setSelectedRooms(prev => 
      prev.filter(room => 
        availableRooms.some(availableRoom => availableRoom.id === room.id)
      )
    );
  }, [availableRooms]);

  const toggleRoom = (room: Room) => {
    setSelectedRooms(prev => {
      const isSelected = prev.find(r => r.id === room.id);
      if (isSelected) {
        return prev.filter(r => r.id !== room.id);
      } else {
        return [...prev, room];
      }
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenity)) {
        return prev.filter(a => a !== amenity);
      } else {
        return [...prev, amenity];
      }
    });
  };

  const calculateTotal = () => {
    const roomTotal = selectedRooms.reduce((total, room) => {
      const price = room.pricePerNight || room.price || 0;
      console.log(`💰 Room ${room.name} price:`, { pricePerNight: room.pricePerNight, price: room.price, finalPrice: price });
      return total + price;
    }, 0);
    const nights = checkIn && checkOut ? 
      Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    console.log(`💰 Total calculation:`, { roomTotal, nights, finalTotal: roomTotal * nights });
    return roomTotal * nights;
  };

  // Update total amount when rooms or dates change
  useEffect(() => {
    setTotalAmount(calculateTotal());
  }, [selectedRooms, checkIn, checkOut]);

  const handleSave = async () => {
    setBookingError('');
    
    // Basic validation for all users
    if (!guestName || !guestEmail) {
      setBookingError('Please fill in your name and email address.');
      return;
    }
    
    // Additional validation for dates and rooms
    if (!checkIn || !checkOut || selectedRooms.length === 0) {
      setBookingError('Please fill in all required fields and select at least one room.');
      return;
    }

    // Validate booking for conflicts (excluding current booking)
    const validation = validateBooking(
      selectedRooms.map(room => room.id),
      property.id,
      checkIn,
      checkOut,
      state.bookings.filter(b => b.id !== booking.id)
    );

    if (!validation.isValid) {
      if (isAdmin) {
        setBookingError(`Selected rooms are not available for the chosen dates. Please select different dates or rooms.`);
      } else {
        setBookingError(`Your selected rooms are not available for the new dates. Please choose different dates or contact support to change your room selection.`);
      }
      return;
    }

    setIsSaving(true);
    
    const updatedBooking: Booking = {
      ...booking,
      guestName,
      guestEmail,
      guestPhone,
      notes: notes.trim() || undefined,
      checkIn,
      checkOut,
      guests,
      // Only include editable fields based on user permissions
      ...(canEditRooms && { roomIds: selectedRooms.map(room => room.id) }),
      ...(canEditAmenities && { selectedAmenities }),
      ...(isAdmin && { 
        totalAmount: calculateTotal(),
        status 
      }),
    };

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(updatedBooking);
    setIsSaving(false);
  };

  const canEditRooms = isAdmin; // Admin can add/remove rooms
  const canEditDates = true; // Both admin and guests can edit dates (using admin API)
  const canEditAmenities = isAdmin; // Only admin can edit amenities
  const canEditGuests = true; // Both admin and guests can edit number of guests (API supports it)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Edit Booking (Admin)' : 'Edit My Booking'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Booking Reference</h3>
                <p className="text-blue-800 font-mono">{booking.referenceId}</p>
              </div>
            </div>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm">{bookingError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Guest Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={!canEditGuests}
                          className={`p-2 border border-gray-300 rounded-lg ${canEditGuests ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium w-8 text-center">{guests}</span>
                        <button
                          onClick={() => setGuests(guests + 1)}
                          disabled={!canEditGuests}
                          className={`p-2 border border-gray-300 rounded-lg ${canEditGuests ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any special requests or notes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Admin-only fields */}
                {isAdmin && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Admin Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Booking Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as Booking['status'])}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="payment_pending">Payment Pending</option>
                        </select>
                      </div>
                      {booking.status === 'confirmed' && status !== 'confirmed' && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <strong>Note:</strong> You are changing the status of a confirmed booking. 
                            This will notify the guest of the status change.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Booking Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-in Date *
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          disabled={!canEditDates}
                          className={`w-full p-3 border border-gray-300 rounded-lg ${canEditDates ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'opacity-50 cursor-not-allowed'}`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date *
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          disabled={!canEditDates}
                          className={`w-full p-3 border border-gray-300 rounded-lg ${canEditDates ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'opacity-50 cursor-not-allowed'}`}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{showCalendar ? 'Hide' : 'Show'} Availability Calendar</span>
                      </button>
                      {!isAdmin && (
                        <p className="text-sm text-gray-600 mt-1">
                          Use the calendar to see available dates for your selected rooms
                        </p>
                      )}
                    </div>

                    {showCalendar && (
                      <div className="mt-4">
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Availability Calendar</h5>
                          <div className="text-sm text-blue-800 space-y-1">
                            <p>• <span className="font-medium">Green dates</span> are available for your selected rooms</p>
                            <p>• <span className="font-medium">Red dates</span> are already booked</p>
                            <p>• <span className="font-medium">Gray dates</span> are in the past</p>
                            {!isAdmin && (
                              <p>• You can change your dates to any available green dates</p>
                            )}
                          </div>
                        </div>
                        <BookingCalendar
                          propertyId={property.id}
                          existingBookings={state.bookings.filter(b => b.id !== booking.id)}
                          selectedCheckIn={checkIn}
                          selectedCheckOut={checkOut}
                          onDateSelect={(date) => {
                            if (!checkIn || (checkIn && checkOut)) {
                              setCheckIn(date);
                              setCheckOut('');
                            } else if (checkIn && !checkOut) {
                              if (new Date(date) > new Date(checkIn)) {
                                setCheckOut(date);
                              } else {
                                setCheckIn(date);
                                setCheckOut('');
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {isAdmin ? 'Manage Rooms (Add/Remove)' : 'Your Selected Rooms'} ({selectedRooms.length} selected)
                    {checkIn && checkOut && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        • {availableRooms.length} available for selected dates
                      </span>
                    )}
                  </h4>
                  {!canEditRooms && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Room selection cannot be changed. Contact support to modify your room selection.
                      </p>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Admin Note:</strong> You can add or remove rooms from this booking. 
                        The guest's original room selection is shown, and you can add additional rooms or remove existing ones. 
                        The total price will be updated based on all selected rooms.
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 max-h-64 overflow-y-auto">
                    {availableRooms.map((room) => {
                      const isSelected = selectedRooms.find(r => r.id === room.id);
                      const isAvailableForDates = checkIn && checkOut ? 
                        isRoomAvailable(room.id, property.id, checkIn, checkOut, 
                          state.bookings.filter(b => b.id !== booking.id)) : true;
                      
                      return (
                        <div
                          key={room.id}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isAvailableForDates
                              ? canEditRooms 
                                ? 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                : 'border-gray-200 bg-gray-50'
                              : 'border-red-200 bg-red-50 opacity-60'
                          }`}
                          onClick={() => canEditRooms && isAvailableForDates && toggleRoom(room)}
                        >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-lg font-medium text-gray-900">
                                  {room.name}
        {isAdmin && isSelected && booking.roomIds.includes(room.id) && (
          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Guest Selected
          </span>
        )}
        {isAdmin && isSelected && !booking.roomIds.includes(room.id) && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Admin Added
          </span>
        )}
                                </h5>
                                <p className="text-sm text-gray-600">{room.type} • Up to {room.capacity} guests</p>
                              {!isAvailableForDates && checkIn && checkOut && (
                                <p className="text-sm text-red-600 font-medium">Not available for selected dates</p>
                              )}
                              {isSelected && !isAvailableForDates && checkIn && checkOut && (
                                <p className="text-sm text-orange-600 font-medium">
                                  ⚠️ This room is not available for your new dates. Please select different dates or contact support.
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">LKR {room.price}</div>
                              <div className="text-sm text-gray-600">per night</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Selected Amenities</h4>
                  {!canEditAmenities && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Amenities cannot be changed. Contact support to modify your amenities.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-32 overflow-y-auto">
                    {availableAmenities.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => canEditAmenities && toggleAmenity(amenity)}
                          disabled={!canEditAmenities}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : canEditAmenities
                              ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                              : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-medium text-sm">{amenity}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{property.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rooms:</span>
                      <span className="font-medium">{selectedRooms.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{guests}</span>
                    </div>
                    {selectedAmenities.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amenities:</span>
                        <span className="font-medium">{selectedAmenities.length} selected</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">LKR {totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-lg font-bold text-gray-900">
            Total: <span className="text-blue-600">LKR {totalAmount}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || bookingError !== ''}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
