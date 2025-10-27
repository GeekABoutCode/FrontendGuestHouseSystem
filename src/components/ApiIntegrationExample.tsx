import React from 'react';
import { useProperties } from '../hooks/useProperties';
import { BookingApiService } from '../lib/api/bookingApi';

/**
 * Example component demonstrating API integration
 * This shows how to use the custom hooks to interact with the backend
 */
export default function ApiIntegrationExample() {
  // Fetch properties from API
  const { properties, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = useProperties();

  const handleCreateBooking = async () => {
    if (properties.length === 0) {
      console.error('No properties available for booking');
      return;
    }
    
    try {
      // Use the first available property
      const firstProperty = properties[0];
      await BookingApiService.createBooking({
        propertyId: firstProperty.id,
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+1234567890',
        checkInDate: '2024-03-01',
        checkOutDate: '2024-03-03',
        noOfRooms: 1,
        noOfGuests: 2,
        notes: 'Test booking',
        roomIds: firstProperty.rooms?.map(room => room.id) || [], // Use actual room IDs
        addonIds: [] // No addons for test booking
      });
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  if (propertiesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading properties...</span>
      </div>
    );
  }

  if (propertiesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error Loading Properties</h3>
        <p className="text-red-600 text-sm mt-1">{propertiesError}</p>
        <button 
          onClick={refetchProperties}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Integration Example</h2>
      
      {/* Properties Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Properties from API</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{property.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{property.location}</p>
              <p className="text-sm text-gray-500 mt-2">
                {property.totalRooms} rooms • {property.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Operations Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Operations</h3>
        <div className="space-y-4">
          <button
            onClick={handleCreateBooking}
            disabled={bookingLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {bookingLoading ? 'Creating...' : 'Create Test Booking'}
          </button>
          
          {bookingSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">{bookingSuccess}</p>
            </div>
          )}
          
          {bookingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{bookingError}</p>
            </div>
          )}
        </div>
      </div>

      {/* API Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">API Status</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Properties loaded: {properties.length}</div>
          <div>API Base URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}</div>
          <div>Environment: {import.meta.env.MODE}</div>
        </div>
      </div>
    </div>
  );
}
