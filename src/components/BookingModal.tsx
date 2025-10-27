import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Plus, Minus, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Property, Room, Booking } from '../types';
import { useApp } from '../context/AppContextWithApi';
import { availableAmenities } from '../data/mockData';
import { isRoomAvailable, validateBooking } from '../lib/bookingUtils';
import BookingCalendar from './BookingCalendar';
import AddonSelection from './AddonSelection';
import PaymentProofModal from './PaymentProofModal';
import { BookingApiService, BookingCreateRequest } from '../lib/api/bookingApi';

interface BookingModalProps {
  property: Property;
  rooms: Room[];
  selectedRooms: Room[];
  onClose: () => void;
}

export default function BookingModal({ property, rooms, selectedRooms: initialSelectedRooms, onClose }: BookingModalProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedRooms, setSelectedRooms] = useState<Room[]>(initialSelectedRooms);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);
  const [bookingError, setBookingError] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [maxTotalOccupancy, setMaxTotalOccupancy] = useState(0);

  // Filter rooms based on availability and booking conflicts
  const availableRooms = useMemo(() => {
    return rooms.filter(room => {
      if (!room.available) return false;
      
      // If dates are selected, check for booking conflicts
      if (checkIn && checkOut) {
        return isRoomAvailable(room.id, property.id, checkIn, checkOut, state.bookings);
      }
      
      return true;
    });
  }, [rooms, checkIn, checkOut, property.id, state.bookings]);

  // Update selected rooms when available rooms change
  useEffect(() => {
    setSelectedRooms(prev => 
      prev.filter(room => 
        availableRooms.some(availableRoom => availableRoom.id === room.id)
      )
    );
  }, [availableRooms]);

  // Calculate max total occupancy when selected rooms change
  useEffect(() => {
    const totalMaxOccupancy = selectedRooms.reduce((sum, room) => {
      return sum + (room.capacity || 0);
    }, 0);
    setMaxTotalOccupancy(totalMaxOccupancy);
  }, [selectedRooms]);

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

  const calculateTotal = () => {
    const roomTotal = selectedRooms.reduce((total, room) => total + (room.price || 0), 0);
    // Calculate nights: checkout day is NOT included in the stay
    // Example: Check-in Oct 25, Check-out Oct 30 = 5 nights (25, 26, 27, 28, 29)
    const nights = checkIn && checkOut ? 
      Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    
    // Calculate room price for the duration
    const roomPriceForDuration = roomTotal * nights;
    
    // Note: Addons are added separately by the backend based on selectedAddonIds
    // The backend will calculate the total including addons
    // This is just the base room price for display purposes
    return roomPriceForDuration;
  };

  const calculateBasePrice = () => {
    return calculateTotal();
  };

  const handlePaymentProofSuccess = () => {
    setShowPaymentProofModal(false);
    setShowReferenceModal(true);
  };

  const handlePaymentProofClose = () => {
    setShowPaymentProofModal(false);
    setShowReferenceModal(true);
  };

  const handleReferenceModalClose = () => {
    setShowReferenceModal(false);
    setCreatedBooking(null);
    onClose();
  };

  const handleSubmit = async () => {
    setBookingError('');
    
    if (!guestName || !guestEmail || !checkIn || !checkOut || selectedRooms.length === 0) {
      setBookingError('Please fill in all required fields and select at least one room.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      setBookingError('Please enter a valid email address.');
      return;
    }

    // Validate guest name length
    if (guestName.length < 3) {
      setBookingError('Guest name must be at least 3 characters long.');
      return;
    }

    // Validate guest name is not too long
    if (guestName.length > 200) {
      setBookingError('Guest name must be less than 200 characters.');
      return;
    }

    // Validate guest count against room capacity
    if (guests > maxTotalOccupancy) {
      setBookingError(`Maximum occupancy for selected rooms is ${maxTotalOccupancy} guests. Please select more rooms or reduce guest count.`);
      return;
    }

    // Validate room availability to prevent double-booking
    const validation = validateBooking(
      selectedRooms.map(room => room.id),
      property.id,
      checkIn,
      checkOut,
      state.bookings
    );

    if (!validation.isValid) {
      setBookingError('Selected rooms are not available for the chosen dates. Please select different dates or rooms.');
      return;
    }

    // Note: Backend will handle room availability validation as final check
    // Frontend validation prevents unnecessary API calls

    try {
      const bookingData: BookingCreateRequest = {
        propertyId: property.id,
        guestName,
        guestEmail,
        guestPhone: guestPhone || '',
        checkInDate: checkIn,
        checkOutDate: checkOut,
        noOfRooms: selectedRooms.length,
        noOfGuests: guests,
        notes: notes || '',
        roomIds: selectedRooms.map(room => room.id),
        addonIds: selectedAddonIds // Use selected addon IDs
      };

      const response = await BookingApiService.createBooking(bookingData);
      
      // Create a frontend booking object for the context
      const frontendBooking: Booking = {
        id: response.token, // Use token as ID for frontend
        referenceId: response.referenceId,
        propertyId: property.id,
        propertyName: property.name,
        roomIds: selectedRooms.map(room => room.id),
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        guests,
        totalAmount: response.totalPrice,
        status: response.status,
        createdAt: response.createdAt,
        notes: notes.trim() || undefined,
      };

      dispatch({ type: 'ADD_BOOKING', payload: frontendBooking });
      dispatch({ type: 'SET_CURRENT_BOOKING', payload: frontendBooking });
      
      // Set the created booking and show payment proof modal
      setCreatedBooking(frontendBooking);
      setShowPaymentProofModal(true);
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to create booking. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific validation errors
        if (errorMessage.includes('must be a well-formed email address')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('size must be between 3 and 200')) {
          errorMessage = 'Guest name must be between 3 and 200 characters.';
        } else if (errorMessage.includes('not available')) {
          errorMessage = 'Selected rooms are not available for the chosen dates. Please select different dates or rooms.';
        } else if (errorMessage.includes('Validation failed')) {
          errorMessage = 'Please check your input and try again.';
        }
      }
      
      setBookingError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Book Your Stay</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {stepNum}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-6">
                {step === 1 && 'Select your rooms'}
                {step === 2 && 'Choose amenities'}
                {step === 3 && 'Select add-ons'}
                {step === 4 && 'Enter guest details'}
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    </div>

                    {showCalendar && (
                      <div className="mt-4">
                        <BookingCalendar
                          propertyId={property.id}
                          existingBookings={state.bookings}
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

                  <div className="space-y-4">
                    {bookingError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-red-800 text-sm">{bookingError}</p>
                        </div>
                      </div>
                    )}

                    {availableRooms.length === 0 && checkIn && checkOut && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <p className="text-yellow-800 text-sm">
                            No rooms are available for the selected dates. Please choose different dates.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                    {maxTotalOccupancy > 0 && (
                      <span className="text-xs text-gray-500 ml-2">(Max: {maxTotalOccupancy} for selected rooms)</span>
                    )}
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className={`text-lg font-medium w-8 text-center ${guests > maxTotalOccupancy ? 'text-red-600' : ''}`}>
                      {guests}
                    </span>
                    <button
                      onClick={() => setGuests(guests + 1)}
                      disabled={maxTotalOccupancy > 0 && guests >= maxTotalOccupancy}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {guests > maxTotalOccupancy && maxTotalOccupancy > 0 && (
                    <p className="text-sm text-red-600 mt-1">Maximum capacity exceeded. Please select more rooms.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Rooms ({selectedRooms.length} selected)
                    {checkIn && checkOut && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        • {availableRooms.length} available for selected dates
                      </span>
                    )}
                  </h4>
                  <div className="grid gap-4">
                    {availableRooms.map((room) => {
                      const isSelected = selectedRooms.find(r => r.id === room.id);
                      const isAvailableForDates = checkIn && checkOut ? 
                        isRoomAvailable(room.id, property.id, checkIn, checkOut, state.bookings) : true;
                      
                      return (
                        <div
                          key={room.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isAvailableForDates
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                          }`}
                          onClick={() => isAvailableForDates && toggleRoom(room)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-lg font-medium text-gray-900">{room.name}</h5>
                              <p className="text-sm text-gray-600">{room.type} • Up to {room.capacity} guests</p>
                              {!isAvailableForDates && checkIn && checkOut && (
                                <p className="text-sm text-red-600 font-medium">Not available for selected dates</p>
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
                    
                    {availableRooms.length === 0 && checkIn && checkOut && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No rooms available</p>
                        <p className="text-sm">Please select different dates to see available rooms.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Available Amenities
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {availableAmenities.map((amenity) => {
                      return (
                        <div
                          key={amenity}
                          className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
                        >
                          <div className="font-medium">{amenity}</div>
                          <div className="text-sm text-gray-500">Available</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <AddonSelection
                selectedAddonIds={selectedAddonIds}
                onAddonSelectionChange={setSelectedAddonIds}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
                basePrice={calculateBasePrice()}
              />
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Special Requests / Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requests or notes for your stay..."
                  />
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
                    <div className="border-t pt-2 mt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">LKR {calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-lg font-bold text-gray-900">
            Total: <span className="text-blue-600">LKR {calculateTotal()}</span>
          </div>
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  step === 1 && (
                    selectedRooms.length === 0 || 
                    !checkIn || 
                    !checkOut || 
                    availableRooms.length === 0
                  )
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={bookingError !== ''}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Proof Modal */}
      {showPaymentProofModal && createdBooking && (
        <PaymentProofModal
          isOpen={showPaymentProofModal}
          referenceId={createdBooking.referenceId}
          onClose={handlePaymentProofClose}
          onSuccess={handlePaymentProofSuccess}
        />
      )}

      {/* Reference ID Success Modal */}
      {showReferenceModal && createdBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your booking has been successfully created. Please save your reference ID for future reference.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Reference ID</label>
                  <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3">
                    <span className="font-mono text-lg font-bold text-blue-600">{createdBooking.referenceId}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdBooking.referenceId);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use this reference ID to track your booking and upload payment proof.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount Paid</label>
                  <div className="text-2xl font-bold text-blue-600">
                    LKR {createdBooking.totalAmount}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Includes room charges and all selected add-ons
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleReferenceModalClose}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowReferenceModal(false);
                    onClose();
                    // Navigate to booking lookup page with reference ID in URL state
                    navigate('/bookings', { 
                      state: { 
                        referenceId: createdBooking.referenceId,
                        autoSearch: true 
                      } 
                    });
                  }}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View My Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}