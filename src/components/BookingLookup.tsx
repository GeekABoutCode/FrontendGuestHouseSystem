import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, User, CreditCard, Clock, CheckCircle, XCircle, Upload, Edit3, FileText, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContextWithApi';
import { Booking, Property } from '../types';
import BookingEditModal from './BookingEditModal';
import PaymentProofModal from './PaymentProofModal';
import { BookingApiService, BookingGuestResponse as ApiBookingGuestResponse } from '../lib/api/bookingApi';
import { AdminBookingApiService } from '../lib/api/adminBookingApi';
import { PropertyApiService } from '../lib/api/propertyApi';
import { transformBookingFromBackend } from '../lib/dataTransformers';
import { usePaymentProof } from '../hooks/usePaymentProof';
import { usePaymentProofOperations } from '../hooks/usePaymentProof';

export default function BookingLookup() {
  const location = useLocation();
  const { state, dispatch } = useApp();
  const [referenceId, setReferenceId] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookingEditModal, setShowBookingEditModal] = useState(false);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Payment proof functionality
  const { paymentProof, hasProof, loading: paymentProofLoading, refetch: refetchPaymentProof } = usePaymentProof(searchedBooking?.referenceId || '');
  const { downloadPaymentProof } = usePaymentProofOperations();

  // Auto-search when navigated from booking confirmation
  useEffect(() => {
    if (location.state && (location.state as any).referenceId && (location.state as any).autoSearch) {
      const autoReferenceId = (location.state as any).referenceId;
      setReferenceId(autoReferenceId);
      // Trigger search after setting the reference ID
      const timer = setTimeout(async () => {
        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
          // First try to find in local state
          const localBooking = state.bookings.find(b => 
            b.referenceId.toLowerCase() === autoReferenceId.toLowerCase().trim()
          );

          if (localBooking) {
            setSearchedBooking(localBooking);
            setLoading(false);
            return;
          }

          // Always fetch from backend API to get the most up-to-date status
          const backendBooking: ApiBookingGuestResponse = await BookingApiService.getBookingByReferenceId(autoReferenceId.trim());
          const transformedBooking = transformBookingFromBackend(backendBooking as any);
          
          setSearchedBooking(transformedBooking);
          
          // Update local state with the latest booking data
          dispatch({ type: 'UPDATE_BOOKING', payload: { id: transformedBooking.id, updates: { ...transformedBooking } } });
          
          // Fetch property details for the booking
          await fetchPropertyForBooking(transformedBooking.propertyId);
        } catch (err) {
          console.error('Error fetching booking:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch booking');
          setSearchedBooking(null);
          setNotFound(true);
        } finally {
          setLoading(false);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state, state.bookings]);

  const handleSearch = async () => {
    if (!referenceId.trim()) return;

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      // Always fetch from backend API to get the most up-to-date status
      const backendBooking: ApiBookingGuestResponse = await BookingApiService.getBookingByReferenceId(referenceId.trim());
      const transformedBooking = transformBookingFromBackend(backendBooking as any);
      
      setSearchedBooking(transformedBooking);
      
      // Update local state with the latest booking data
      dispatch({ type: 'UPDATE_BOOKING', payload: { id: transformedBooking.id, updates: { ...transformedBooking } } });
      
      // Fetch property details for the booking
      await fetchPropertyForBooking(transformedBooking.propertyId);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
      setSearchedBooking(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchPropertyForBooking = async (propertyId: string) => {
    try {
      console.log('Fetching property details for:', propertyId);
      
      // First try to find in local state
      const localProperty = state.properties.find(p => p.id === propertyId);
      if (localProperty && localProperty.rooms && localProperty.rooms.length > 0) {
        console.log('Using local property:', localProperty);
        setBookingProperty(localProperty);
        return;
      }
      
      // If not found locally or rooms not loaded, fetch from backend
      const backendProperty = await PropertyApiService.getPropertyById(propertyId);
      console.log('Fetched property from backend:', backendProperty);
      
      // Transform to frontend format
      const transformedProperty: Property = {
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
        images: [],
        rating: 4.0,
        pricePerNight: 0,
        amenities: [],
        rooms: backendProperty.rooms.map(room => ({
          id: room.id,
          roomNumber: room.roomNumber,
          type: room.type,
          capacity: room.capacity,
          pricePerNight: room.pricePerNight,
          isAvailable: room.isAvailable,
          amenities: [],
          images: [],
          name: room.roomNumber,
          price: room.pricePerNight,
          available: room.isAvailable
        }))
      };
      
      setBookingProperty(transformedProperty);
    } catch (error) {
      console.error('Error fetching property:', error);
      // Create a minimal property object to allow editing
      const fallbackProperty: Property = {
        id: propertyId,
        name: 'Property',
        description: '',
        location: '',
        city: '',
        country: '',
        isActive: true,
        phoneNumber: '',
        totalRooms: 0,
        email: '',
        checkInTime: '',
        checkOutTime: '',
        coverImageUrl: '',
        images: [],
        rating: 4.0,
        pricePerNight: 0,
        amenities: [],
        rooms: []
      };
      setBookingProperty(fallbackProperty);
    }
  };

  const handleEditBooking = async () => {
    // Ensure we have the property data before opening the modal
    if (!bookingProperty && searchedBooking) {
      await fetchPropertyForBooking(searchedBooking.propertyId);
    }
    setShowBookingEditModal(true);
  };

  const handlePaymentProofSuccess = () => {
    refetchPaymentProof();
  };

  const handleDownloadPaymentProof = async () => {
    if (!searchedBooking?.referenceId) return;
    
    try {
      await downloadPaymentProof(searchedBooking.referenceId);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download payment proof. Please try again.');
    }
  };

  const handleSaveBooking = async (updatedBooking: Booking) => {
    try {
      // Check if dates or rooms have changed (require admin API)
      const datesChanged = updatedBooking.checkIn !== searchedBooking?.checkIn || 
                          updatedBooking.checkOut !== searchedBooking?.checkOut;
      const roomsChanged = JSON.stringify(updatedBooking.roomIds) !== JSON.stringify(searchedBooking?.roomIds);
      
      console.log('Booking update analysis:', {
        datesChanged,
        roomsChanged,
        searchedBookingId: searchedBooking?.id,
        searchedBookingToken: searchedBooking?.token,
        searchedBookingReferenceId: searchedBooking?.referenceId,
        isAdminBooking: searchedBooking?.id && searchedBooking.id !== searchedBooking?.token
      });
      
      // Check if we have a UUID (admin booking) or just referenceId (guest booking)
      const hasUuid = searchedBooking?.id && searchedBooking.id !== searchedBooking?.token && 
                      searchedBooking.id !== searchedBooking?.referenceId;
      
      if (hasUuid && (datesChanged || roomsChanged)) {
        // Use admin API for admin bookings with date/room changes
        console.log('Using admin API for admin booking with date/room changes');
        
        const adminUpdateData = {
          guestName: updatedBooking.guestName,
          guestEmail: updatedBooking.guestEmail,
          guestPhone: updatedBooking.guestPhone,
          checkInDate: updatedBooking.checkIn,
          checkOutDate: updatedBooking.checkOut,
          noOfRooms: updatedBooking.roomIds.length,
          noOfGuests: updatedBooking.guests,
          notes: updatedBooking.notes,
          roomIds: updatedBooking.roomIds
        };
        
        const backendResponse = await AdminBookingApiService.updateBooking(searchedBooking.id, adminUpdateData);
        console.log('Admin API update response:', backendResponse);
      } else if (datesChanged || roomsChanged) {
        // For guest bookings with date/room changes, we can't update them via API
        // since guest API doesn't support date/room changes
        throw new Error('Date and room changes are not allowed for guest bookings. Please contact support to modify your booking.');
      } else {
        // Use guest API for basic info changes (both admin and guest bookings)
        const patchData = {
          guestName: updatedBooking.guestName,
          guestEmail: updatedBooking.guestEmail,
          guestPhone: updatedBooking.guestPhone,
          noOfGuests: updatedBooking.guests,
          notes: updatedBooking.notes
        };

        console.log('Using guest API for basic info changes:', updatedBooking.referenceId, patchData);
        const backendResponse = await BookingApiService.updateBooking(updatedBooking.referenceId, patchData);
        console.log('Guest API update response:', backendResponse);
      }

      // Update local state
      dispatch({
        type: 'UPDATE_BOOKING',
        payload: { id: updatedBooking.id, updates: updatedBooking }
      });
      
      setSearchedBooking(updatedBooking);
      setShowBookingEditModal(false);
      setShowSuccessMessage(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Booking</h1>
          <p className="text-lg text-gray-600 mb-6">
            Enter your booking reference ID to view your reservation details
          </p>
          
          {/* Information for guests */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">How to find your booking:</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Your booking reference ID was provided when you made the reservation</li>
              <li>• It looks like "GHM-XXXXXXXX" (e.g., GHM-E4DEFEB7)</li>
              <li>• You can find it in your booking confirmation email or on the booking confirmation page</li>
              <li>• If you can't find your reference ID, please contact support</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Reference ID
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => {
                  setReferenceId(e.target.value);
                  setNotFound(false);
                  setSearchedBooking(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="e.g., GH-2024-001"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Booking</h3>
            <p className="text-red-700 mb-4">
              {error}
            </p>
            <p className="text-sm text-red-600">
              Please check your reference ID and try again. If the problem persists, contact support.
            </p>
          </div>
        )}

        {notFound && !error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Booking Not Found</h3>
            <p className="text-red-700 mb-4">
              No booking found with reference ID "{referenceId}". Please check your reference ID and try again.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-yellow-900 mb-2">Troubleshooting Tips:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Make sure you're using the correct reference ID from your booking confirmation</li>
                <li>• Check for any typos in the reference ID</li>
                <li>• If you created this booking on a different device, you may need to contact support</li>
                <li>• Try refreshing the page and searching again</li>
              </ul>
            </div>
          </div>
        )}

        {searchedBooking && (
          <>
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">Booking Updated Successfully!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your booking changes have been saved. You can view the updated details below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
                    <p className="text-blue-100">Reference: {searchedBooking.referenceId}</p>
                  </div>
                  <div className="text-right">
                    {getStatusIcon(searchedBooking.status)}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Reservation Information</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleEditBooking}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Booking
                    </button>
                    <span className={getStatusBadge(searchedBooking.status)}>
                      {searchedBooking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Edit your booking:</strong> You can modify your guest information, check-in/check-out dates, 
                    number of guests, and special requests. Use the availability calendar to see which dates are available for your rooms.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">{searchedBooking.propertyName}</div>
                        <div className="text-sm text-gray-600">Property</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">{searchedBooking.guestName}</div>
                        <div className="text-sm text-gray-600">{searchedBooking.guestEmail}</div>
                        {searchedBooking.guestPhone && (
                          <div className="text-sm text-gray-600">{searchedBooking.guestPhone}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Check-in: {formatDate(searchedBooking.checkIn)}
                        </div>
                        <div className="font-medium text-gray-900">
                          Check-out: {formatDate(searchedBooking.checkOut)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {calculateNights(searchedBooking.checkIn, searchedBooking.checkOut)} nights • {searchedBooking.guests} guests
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-gray-400 mt-1 flex items-center justify-center">
                        <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {searchedBooking.roomIds.length} Room{searchedBooking.roomIds.length !== 1 ? 's' : ''} Booked
                        </div>
                        <div className="text-sm text-gray-600">
                          Room Numbers: {searchedBooking.roomIds.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">LKR {searchedBooking.totalAmount}</div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                      </div>
                    </div>

                    {searchedBooking.selectedAmenities && searchedBooking.selectedAmenities.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">Selected Amenities</div>
                        <div className="flex flex-wrap gap-2">
                          {searchedBooking.selectedAmenities?.map((amenity, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          )) || <span className="text-gray-500 text-sm">No amenities selected</span>}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-2">Booking Created</div>
                      <div className="text-sm text-gray-600">
                        {new Date(searchedBooking.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {searchedBooking.status === 'pending' && (
                  <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-orange-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-orange-900">Payment Pending</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Your booking is confirmed but payment is still pending. Please complete the payment process to secure your reservation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {searchedBooking.status === 'confirmed' && (
                  <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-900">Booking Confirmed</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your booking is confirmed! We look forward to welcoming you.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {searchedBooking.status === 'cancelled' && (
                  <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-red-900">Booking Cancelled</h4>
                        <p className="text-sm text-red-700 mt-1">
                          This booking has been cancelled. If you have any questions, please contact our support team.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

              {/* Payment Proof Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Payment Proof</h4>
                  <button
                    onClick={() => setShowPaymentProofModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {hasProof ? 'Update Payment Proof' : 'Upload Payment Proof'}
                  </button>
                </div>

                {paymentProofLoading ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment proof...</p>
                  </div>
                ) : hasProof && paymentProof ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-900">Payment proof uploaded</p>
                          <p className="text-sm text-green-700">
                            {paymentProof.fileName} • {paymentProof.formattedFileSize}
                          </p>
                          <p className="text-xs text-green-600">
                            Uploaded: {new Date(paymentProof.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleDownloadPaymentProof}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowPaymentProofModal(true)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Update/Delete"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">No payment proof uploaded</p>
                        <p className="text-sm text-gray-600">
                          Upload your payment confirmation to complete your booking
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Payment Instructions</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Transfer the total amount to our bank account</p>
                    <p>• Account: GuestHousePro - 1234567890</p>
                    <p>• Include your booking reference in the transfer note</p>
                    <p>• Upload a screenshot or photo of the transfer confirmation</p>
                    <p>• Supported formats: JPEG, PNG, PDF, WebP, GIF (max 5MB)</p>
                  </div>
                </div>
              </div>
          </>
        )}

        {!searchedBooking && !notFound && !error && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Your Booking</h3>
            <p className="text-gray-600">
              Enter your booking reference ID above to view your reservation details
            </p>
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {showPaymentProofModal && searchedBooking && (
        <PaymentProofModal
          isOpen={showPaymentProofModal}
          onClose={() => setShowPaymentProofModal(false)}
          referenceId={searchedBooking.referenceId}
          onSuccess={handlePaymentProofSuccess}
        />
      )}

      {/* Booking Edit Modal */}
      {showBookingEditModal && searchedBooking && bookingProperty && (
        <BookingEditModal
          booking={searchedBooking}
          property={bookingProperty}
          isAdmin={false}
          onClose={() => setShowBookingEditModal(false)}
          onSave={handleSaveBooking}
        />
      )}
    </div>
  );
}