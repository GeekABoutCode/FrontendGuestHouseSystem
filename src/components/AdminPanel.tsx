import { useState, useEffect } from 'react';
import { Plus, X, UserPlus, Home, Clock, Shield, Edit, Trash2, Filter, Calendar as CalendarIcon, List } from 'lucide-react';
import { useApp } from '../context/AppContextWithApi';
import { usePropertiesWithRooms } from '../hooks/usePropertiesWithRooms';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAddons } from '../hooks/useAddons';
import { useAmenities, useAmenityManagement } from '../hooks/useAmenities';
import { useReviews, useReviewManagement } from '../hooks/useReviews';
import AmenityModal from './AmenityModal';
import AdminLogin from './AdminLogin';
import AdminBookingsCalendar from './AdminBookingsCalendar';
import { AuthApiService } from '../lib/api/authApi';

interface AdminPanelProps {
  onLogout?: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { state, dispatch } = useApp();
  const { properties: propertiesWithRooms, refetch: refetchPropertiesWithRooms } = usePropertiesWithRooms();
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'admins' | 'amenities' | 'addons' | 'reviews'>('properties');
  const [bookingViewMode, setBookingViewMode] = useState<'list' | 'calendar'>('list');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'expired'>('all');
  
  // Use real API for admin users, addons, and amenities
  const { adminUsers } = useAdminUsers();
  const { addons, refetch: refetchAddons } = useAddons();
  const { amenities, refetch: refetchAmenities } = useAmenities();
  const { createAmenity, deleteAmenity, loading: amenityLoading } = useAmenityManagement();
  const { reviews, refetch: refetchReviews } = useReviews();
  const { deleteReview, searchReviews, loading: reviewLoading } = useReviewManagement();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState<{ show: boolean; property?: any }>({ show: false });
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddAmenityModal, setShowAddAmenityModal] = useState(false);
  const [showEditAmenityModal, setShowEditAmenityModal] = useState<{ show: boolean; amenity?: any }>({ show: false });
  const [showAddAddonModal, setShowAddAddonModal] = useState(false);
  const [showEditAddonModal, setShowEditAddonModal] = useState<{ show: boolean; addon?: any }>({ show: false });
  const [showAddRoomModal, setShowAddRoomModal] = useState<{ show: boolean; propertyId?: string }>({ show: false });
  const [showEditRoomModal, setShowEditRoomModal] = useState<{ show: boolean; room?: any; propertyId?: string }>({ show: false });
  const [showBookingEditModal, setShowBookingEditModal] = useState<{ show: boolean; bookingId?: string }>({ show: false });
  const [showPaymentProofViewer, setShowPaymentProofViewer] = useState<{ show: boolean; referenceId?: string }>({ show: false });
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState<{ show: boolean; propertyId?: string; roomId?: string }>({ show: false });
  const [showEditAdminModal, setShowEditAdminModal] = useState<{ show: boolean; admin?: any }>({ show: false });
  const [showCurrentUserEditModal, setShowCurrentUserEditModal] = useState(false);
  
  // Initialize current user data
  useEffect(() => {
    const userInfo = AuthApiService.getUserInfo();
    if (userInfo) {
      setCurrentUser(userInfo);
    }
  }, []);
  
  // Amenity management handlers
  const handleDeleteAmenity = async (amenityId: string) => {
    if (window.confirm('Are you sure you want to delete this amenity? This action cannot be undone.')) {
      try {
        await deleteAmenity(amenityId);
        refetchAmenities();
      } catch (error) {
        console.error('Error deleting amenity:', error);
        alert('Failed to delete amenity. Please try again.');
      }
    }
  };

  const handleEditAmenity = (amenity: any) => {
    setShowEditAmenityModal({ show: true, amenity });
  };

  const handleSaveAmenity = async (amenityData: { name: string; description?: string; iconUrl?: string; isActive?: boolean }) => {
    try {
      // Check if we're editing an existing amenity
      if (showEditAmenityModal.show && showEditAmenityModal.amenity) {
        // For editing: delete the old amenity and create a new one
        // This is a workaround since the backend doesn't have an update amenity endpoint
        await deleteAmenity(showEditAmenityModal.amenity.id);
        await createAmenity(amenityData);
        setShowEditAmenityModal({ show: false });
      } else {
        // For creating: just create the new amenity
        await createAmenity(amenityData);
        setShowAddAmenityModal(false);
      }
      refetchAmenities();
    } catch (error) {
      console.error('Error saving amenity:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };
  
  // Addon management handlers
  const handleDeleteAddon = async (addonId: string) => {
    if (window.confirm('Are you sure you want to delete this addon? This action cannot be undone.')) {
      try {
        const { AddonApiService } = await import('../lib/api/addonApi');
        await AddonApiService.deleteAddon(addonId);
        refetchAddons();
      } catch (error) {
        console.error('Error deleting addon:', error);
        alert('Failed to delete addon. Please try again.');
      }
    }
  };

  const handleToggleAddonStatus = async (addonId: string, isActive: boolean) => {
    try {
      const { AddonApiService } = await import('../lib/api/addonApi');
      if (isActive) {
        await AddonApiService.activateAddon(addonId);
      } else {
        await AddonApiService.deactivateAddon(addonId);
      }
      refetchAddons();
    } catch (error) {
      console.error('Error toggling addon status:', error);
      alert('Failed to update addon status. Please try again.');
    }
  };

  const handleEditAddon = (addon: any) => {
    setShowEditAddonModal({ show: true, addon });
  };

  // Property management handlers
  const handleEditProperty = (property: any) => {
    setShowEditPropertyModal({ show: true, property });
  };

  // Handler functions for room management
  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.\n\nNote: This will fail if there are active bookings for this property.')) {
      try {
        const { PropertyApiService } = await import('../lib/api/propertyApi');
        await PropertyApiService.deleteProperty(propertyId);
        await refetchPropertiesWithRooms();
      } catch (error) {
        console.error('Error deleting property:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete property. Please try again.';
        
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('booking_room')) {
          alert('Cannot delete this property because it has active bookings. Please cancel or complete all bookings first, then try again.');
        } else {
          alert(`Failed to delete property: ${errorMessage}`);
        }
      }
    }
  };

  const handleDeleteRoom = async (propertyId: string, roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.\n\nNote: This will fail if there are active bookings for this room.')) {
      try {
        const { RoomApiService } = await import('../lib/api/roomApi');
        await RoomApiService.deleteRoom(propertyId, roomId);
        await refetchPropertiesWithRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete room. Please try again.';
        
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('booking_room')) {
          alert('Cannot delete this room due to database constraints. Please try again or contact support.');
        } else {
          alert(`Failed to delete room: ${errorMessage}`);
        }
      }
    }
  };

  const handleToggleRoomAvailability = async (propertyId: string, roomId: string, available: boolean) => {
    try {
      const { RoomApiService } = await import('../lib/api/roomApi');
      await RoomApiService.toggleRoomAvailability(propertyId, roomId, { available });
      
      // Add a small delay to ensure the backend has processed the change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh the properties data
      await refetchPropertiesWithRooms();
    } catch (error) {
      console.error('Error toggling room availability:', error);
      alert('Failed to update room availability. Please try again.');
    }
  };

  const handleEditRoom = async (formData: FormData) => {
    if (!showEditRoomModal.room || !showEditRoomModal.propertyId) return;
    
    try {
      const { RoomApiService } = await import('../lib/api/roomApi');
      
      const updateData = {
        roomType: formData.get('roomType') as string,
        roomNumber: formData.get('roomNumber') as string,
        description: formData.get('description') as string,
        pricePerNight: parseFloat(formData.get('pricePerNight') as string),
        maxOccupancy: parseInt(formData.get('maxOccupancy') as string),
        isAvailable: formData.get('isAvailable') === 'on',
        imageUrl: formData.get('imageUrl') as string
      };

      await RoomApiService.updateRoom(showEditRoomModal.propertyId, showEditRoomModal.room.id, updateData);
      
      // Store the updated capacity in localStorage for frontend display
      localStorage.setItem(`room_capacity_${showEditRoomModal.room.id}`, updateData.maxOccupancy.toString());
      
      // Add a small delay to ensure the backend has processed the change
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh the properties data
      await refetchPropertiesWithRooms();
      
      // Close the modal
      setShowEditRoomModal({ show: false });
      
      alert('Room updated successfully!');
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room. Please try again.');
    }
  };

  // Admin management handlers
  const handleEditAdmin = (admin: any) => {
    setShowEditAdminModal({ show: true, admin });
  };

  const handleEditCurrentUser = () => {
    setShowCurrentUserEditModal(true);
  };

  const handleSaveAdmin = async (formData: FormData) => {
    if (!showEditAdminModal.admin) return;
    
    try {
      const { AdminUserApiService } = await import('../lib/api/adminUserApi');
      
      const password = formData.get('password') as string;
      const patchData: any = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      };

      // Only include password if it's provided
      if (password && password.trim() !== '') {
        patchData.password = password;
      }

      await AdminUserApiService.patchAdminUser(showEditAdminModal.admin.id, patchData);
      
      // Close the modal
      setShowEditAdminModal({ show: false });
      
      alert('Admin updated successfully!');
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Failed to update admin. Please try again.');
    }
  };

  const handleSaveCurrentUser = async (formData: FormData) => {
    try {
      const updateData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        profilePicture: formData.get('profilePicture') as string,
      };

      // For now, just update the local state and localStorage
      // In a real app, you'd call a backend API to update the user profile
      const updatedUser = { ...currentUser, ...updateData };
      setCurrentUser(updatedUser);
      
      // Update localStorage
      AuthApiService.setAuthData(
        AuthApiService.getToken() || '', 
        {
          username: updateData.name,
          email: updateData.email,
          lastLogin: currentUser?.lastLogin || new Date().toISOString()
        }
      );
      
      setShowCurrentUserEditModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating current user:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Review management handlers
  const handleDeleteReview = async (referenceId: string) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReview(referenceId);
        refetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  const handleSearchReviews = async (guestName: string) => {
    try {
      await searchReviews(guestName);
      // Search results are handled by the reviews hook
    } catch (error) {
      console.error('Error searching reviews:', error);
      alert('Failed to search reviews. Please try again.');
    }
  };

  // Booking management handlers
  const handleConfirmBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      try {
        const { AdminBookingApiService } = await import('../lib/api/adminBookingApi');
        await AdminBookingApiService.confirmBooking(bookingId);
        // Refresh bookings
        window.location.reload();
          } catch (error) {
        console.error('Error confirming booking:', error);
        alert('Failed to confirm booking. Please try again.');
      }
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const { AdminBookingApiService } = await import('../lib/api/adminBookingApi');
        await AdminBookingApiService.cancelBooking(bookingId, { reason: 'Cancelled by admin' });
        // Refresh bookings
        window.location.reload();
          } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleViewPaymentProof = async (referenceId: string) => {
    try {
      const { PaymentProofApiService } = await import('../lib/api/paymentProofApi');
      const paymentProof = await PaymentProofApiService.getPaymentProofByReferenceId(referenceId);
      if (paymentProof) {
        setShowPaymentProofViewer({ show: true, referenceId });
            } else {
        alert('No payment proof found for this booking.');
            }
          } catch (error) {
      console.error('Error fetching payment proof:', error);
      alert('No payment proof found for this booking.');
    }
  };

  const handleUploadPhoto = async (propertyId?: string, roomId?: string) => {
    setShowPhotoUploadModal({ show: true, propertyId, roomId });
  };

  // Show login form if not authenticated
  if (!state.isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={() => {}} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage properties and bookings</p>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {currentUser?.username || currentUser?.email}</span>
                <button
                  onClick={handleEditCurrentUser}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                  title="Edit Profile"
                >
                  Edit Profile
                </button>
              <button
                onClick={() => {
                  AuthApiService.logout();
                  dispatch({ type: 'SET_ADMIN_LOGIN', payload: false });
                  setCurrentUser(null);
                  if (onLogout) {
                    onLogout();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'properties'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Properties ({propertiesWithRooms.length})
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'bookings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Bookings ({state.bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'admins'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Admins ({adminUsers.length})
                </button>
                <button
                  onClick={() => setActiveTab('amenities')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'amenities'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Amenities ({amenities.length})
                </button>
                <button
                  onClick={() => setActiveTab('addons')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'addons'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Addons ({addons.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'properties' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Properties</h2>
                    <button 
                      onClick={() => setShowPropertyModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </button>
                  </div>

                  <div className="space-y-6">
                    {propertiesWithRooms.map((property) => (
                      <div key={property.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {/* Property Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-4">
                                <img
                                src={property.coverImageUrl || property.images[0] || 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800'}
                                  alt={property.name}
                                className="h-16 w-16 rounded-lg object-cover shadow-md"
                              />
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                                <p className="text-gray-600 mt-1">{property.location}</p>
                                {property.description && (
                                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{property.description}</p>
                                )}
                                <div className="flex items-center space-x-6 mt-2">
                                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                    {property.rooms.length} rooms
                                    </span>
                                  <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                                    LKR {property.pricePerNight}/night
                                  </span>
                                  <span className="text-sm text-gray-600 bg-yellow-100 px-2 py-1 rounded-full">
                                      ⭐ {property.rating}
                                    </span>
                                  <span className="text-sm text-gray-600 bg-green-100 px-2 py-1 rounded-full">
                                    {property.rooms.filter(room => room.available).length} available
                                    </span>
                                  </div>
                                </div>
                              </div>
                            <div className="flex space-x-2">
                                <button 
                                onClick={() => handleEditProperty(property)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                              >
                                Edit Property
                                </button>
                                <button 
                                onClick={() => handleUploadPhoto(property.id)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                              >
                                Add Photos
                                </button>
                                <button 
                                onClick={() => {
                                  // Switch to reviews tab and filter by property
                                  setActiveTab('reviews');
                                  // You could add property filtering logic here
                                }}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                              >
                                View Reviews
                                </button>
                                <button 
                                onClick={() => handleDeleteProperty(property.id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                              >
                                Delete Property
                                </button>
                            </div>
                          </div>
                        </div>

                        {/* Rooms Section */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Rooms Management</h4>
                                <button 
                              onClick={() => setShowAddRoomModal({ show: true, propertyId: property.id })}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Room
                                </button>
                          </div>

                          {property.rooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {property.rooms.map((room) => (
                                <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold text-gray-900">{room.name}</h5>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      room.available 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {room.available ? 'Available' : 'Unavailable'}
                                    </span>
                              </div>
                              
                                  <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Capacity:</span>
                                      <span className="font-medium">{room.capacity} guests</span>
                                        </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Price:</span>
                                      <span className="font-medium">LKR {room.pricePerNight}/night</span>
                                        </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Type:</span>
                                      <span className="font-medium">{room.type}</span>
                                        </div>
                                      </div>

                                  <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <button
                                        onClick={() => handleToggleRoomAvailability(property.id, room.id, !room.available)}
                                        className={`flex-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            room.available
                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                        }`}
                                      >
                                        {room.available ? 'Mark Unavailable' : 'Mark Available'}
                                      </button>
                                      <button
                                        onClick={() => setShowEditRoomModal({ show: true, room, propertyId: property.id })}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                      >
                                        Edit
                                        </button>
                                      <button
                                        onClick={() => handleDeleteRoom(property.id, room.id)}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                      >
                                        Delete
                                        </button>
                                      </div>
                                    <button
                                      onClick={() => handleUploadPhoto(undefined, room.id)}
                                      className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                    >
                                      Add Photos
                                    </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                          ) : (
                                <div className="text-center py-8 text-gray-500">
                              <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p>No rooms found for this property</p>
                                  <button
                                onClick={() => setShowAddRoomModal({ show: true, propertyId: property.id })}
                                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Add your first room
                                  </button>
                                </div>
                              )}
                            </div>
                        </div>
                    ))}
                  </div>

                  {propertiesWithRooms.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No properties found</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex space-x-2">
                        <span className="text-sm text-gray-600">
                          {state.bookings.filter(b => b.status === 'pending').length} pending
                        </span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">
                          {state.bookings.filter(b => b.status === 'expired').length} expired
                        </span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">
                          {state.bookings.filter(b => b.status === 'confirmed').length} confirmed
                        </span>
                      </div>
                      
                      {/* View Toggle */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setBookingViewMode('list')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                            bookingViewMode === 'list' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <List className="w-4 h-4" />
                          List
                        </button>
                        <button
                          onClick={() => setBookingViewMode('calendar')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                            bookingViewMode === 'calendar' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <CalendarIcon className="w-4 h-4" />
                          Calendar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => setBookingStatusFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingStatusFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setBookingStatusFilter('pending')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingStatusFilter === 'pending'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setBookingStatusFilter('confirmed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingStatusFilter === 'confirmed'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Confirmed
                    </button>
                    <button
                      onClick={() => setBookingStatusFilter('cancelled')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingStatusFilter === 'cancelled'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancelled
                    </button>
                    <button
                      onClick={() => setBookingStatusFilter('expired')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingStatusFilter === 'expired'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Expired
                    </button>
                  </div>

                  {/* Conditional Rendering: Calendar View */}
                  {bookingViewMode === 'calendar' ? (
                    <AdminBookingsCalendar 
                      properties={propertiesWithRooms}
                      bookings={state.bookings.filter(b => 
                        bookingStatusFilter === 'all' || b.status === bookingStatusFilter
                      )}
                    />
                  ) : (
                    /* List View */
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guests
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {state.bookings
                          .filter(booking => booking.id.length >= 36) // Only show admin bookings (UUIDs)
                          .filter(booking => bookingStatusFilter === 'all' || booking.status === bookingStatusFilter)
                          .map((booking) => (
                          <>
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {booking.referenceId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.guestName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.guestEmail}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {booking.propertyName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>{booking.checkIn}</div>
                              <div className="text-gray-500">to {booking.checkOut}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {booking.guests}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              LKR {booking.totalAmount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'expired'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {booking.status === 'pending' && (
                                     <button
                                    onClick={() => handleConfirmBooking(booking.id)}
                                    className="text-green-600 hover:text-green-900 font-medium"
                                     >
                                    Accept
                                     </button>
                                   )}
                                    <button
                                  onClick={() => setShowBookingEditModal({ show: true, bookingId: booking.id })}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                    >
                                  Edit
                                    </button>
                                    <button
                                  onClick={() => handleViewPaymentProof(booking.referenceId)}
                                  className="text-purple-600 hover:text-purple-900 font-medium"
                                    >
                                  Payment
                                    </button>
                                {booking.status !== 'cancelled' && (
                                     <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="text-red-600 hover:text-red-900 font-medium"
                                     >
                                    Cancel
                                     </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {booking.roomIds && booking.roomIds.length > 0 && (
                            <tr className="bg-gray-50">
                              <td colSpan={8} className="px-6 py-3">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Booked Rooms:</span>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {booking.roomIds.map((roomId) => {
                                      // Find the room details from all properties
                                      const room = propertiesWithRooms
                                        .flatMap((p: any) => p.rooms)
                                        .find((r: any) => r.id === roomId);
                                      
                                      return (
                                        <div key={roomId} className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                          <div className="font-medium text-gray-900">{room?.roomNumber || room?.name || roomId.substring(0, 8)}</div>
                                          <div className="text-xs text-gray-600">{room?.type || 'N/A'}</div>
                                          <div className="text-xs text-gray-500">Capacity: {room?.capacity || 'N/A'} guests</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </>
                        ))}
                      </tbody>
                    </table>
                    {state.bookings.filter(booking => booking.id.length >= 36).length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No bookings found</p>
                      </div>
                    )}
                    </div>
                  )
                  }
                </div>
              )}

              {activeTab === 'admins' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Admin Accounts</h2>
                      <button
                      onClick={() => setShowAddAdminModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New Admin
                      </button>
                  </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {adminUsers.map((admin) => (
                            <tr key={admin.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                      <Shield className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {admin.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {admin.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditAdmin(admin)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Edit Admin"
                                  >
                                  Edit
                                  </button>
                                  <button
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                    title="Delete admin"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  {adminUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No admin users found</p>
                </div>
              )}
            </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
              <button
                      onClick={() => setShowAddAmenityModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Amenity
              </button>
            </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {amenity.iconUrl && (
                              <img src={amenity.iconUrl} alt={amenity.name} className="w-8 h-8" />
                            )}
                <div>
                              <h3 className="font-medium text-gray-900">{amenity.name}</h3>
                              {amenity.description && (
                                <p className="text-sm text-gray-500">{amenity.description}</p>
                              )}
                </div>
                  </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              amenity.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {amenity.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => handleEditAmenity(amenity)}
                              className="text-blue-600 hover:text-blue-800 transition-colors mr-2"
                              title="Edit amenity"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAmenity(amenity.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete amenity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                </div>
              </div>
                      </div>
                  ))}
                </div>

                  {amenities.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No amenities found</p>
              </div>
                  )}
                </div>
              )}

              {activeTab === 'addons' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Addons</h2>
                  <button
                      onClick={() => setShowAddAddonModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Addon
                  </button>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {addons.map((addon) => (
                      <div key={addon.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{addon.name}</h3>
                            {addon.description && (
                              <p className="text-sm text-gray-500 mb-2">{addon.description}</p>
                            )}
                            <p className="text-lg font-bold text-blue-600">LKR {addon.price.toFixed(2)}</p>
                        </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              addon.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {addon.active ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex space-x-1">
                          <button
                                onClick={() => handleEditAddon(addon)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit addon"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddon(addon.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete addon"
                              >
                                <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleToggleAddonStatus(addon.id, !addon.active)}
                            className={`w-full px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              addon.active
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {addon.active ? 'Deactivate' : 'Activate'}
                          </button>
                      </div>
                    </div>
                  ))}
                </div>

                  {addons.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No addons found</p>
              </div>
                  )}
            </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        placeholder="Search by guest name..."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const guestName = (e.target as HTMLInputElement).value;
                            if (guestName.trim()) {
                              handleSearchReviews(guestName);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Guest Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Property
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Comment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reviews.map((review) => (
                            <tr key={review.referenceId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {review.guestName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {review.propertyName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-lg ${
                                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                <div className="truncate" title={review.comment}>
                                  {review.comment || 'No comment'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleDeleteReview(review.referenceId)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete Review"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {reviews.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No reviews found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddAmenityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Amenity</h2>
              <button
                onClick={() => setShowAddAmenityModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const amenityData = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  iconUrl: formData.get('iconUrl') as string,
                  isActive: formData.get('isActive') === 'on'
                };
                
                try {
                  const { AmenityApiService } = await import('../lib/api/amenityApi');
                  await AmenityApiService.createAmenity(amenityData);
                  setShowAddAmenityModal(false);
                  // Refresh amenities list
                  window.location.reload();
                } catch (error) {
                  console.error('Error creating amenity:', error);
                  alert('Failed to create amenity. Please try again.');
                }
              }} className="space-y-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenity Name *</label>
                    <input
                      type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amenity name"
                    />
                  </div>
                
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amenity description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                  <input
                    type="url"
                    name="iconUrl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter icon URL (optional)"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active (available for selection)
                    </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAmenityModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Amenity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddAddonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Addon</h2>
              <button
                onClick={() => setShowAddAddonModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const addonData = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  price: parseFloat(formData.get('price') as string),
                  active: formData.get('active') === 'on'
                };
                
                try {
                  const { AddonApiService } = await import('../lib/api/addonApi');
                  await AddonApiService.createAddon(addonData);
                  setShowAddAddonModal(false);
                  refetchAddons();
                } catch (error) {
                  console.error('Error creating addon:', error);
                  alert('Failed to create addon. Please try again.');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Addon Name *</label>
                    <input
                      type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter addon name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter addon description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                      name="price"
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active (available for selection)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                    onClick={() => setShowAddAddonModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                        </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Addon
                  </button>
                  </div>
              </form>
                </div>
              </div>
            </div>
      )}

      {/* Edit Property Modal */}
      {showEditPropertyModal.show && showEditPropertyModal.property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Property</h2>
              <button
                onClick={() => setShowEditPropertyModal({ show: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const propertyData = {
                  name: formData.get('name') as string,
                  description: (formData.get('description') as string) || undefined,
                  location: formData.get('location') as string,
                  city: formData.get('city') as string,
                  country: formData.get('country') as string,
                  phoneNumber: formData.get('phoneNumber') as string,
                  email: formData.get('email') as string,
                  totalRooms: parseInt(formData.get('totalRooms') as string),
                  checkInTime: formData.get('checkInTime') as string,
                  checkOutTime: formData.get('checkOutTime') as string,
                  coverImageUrl: (formData.get('coverImageUrl') as string) || undefined,
                  isActive: formData.get('isActive') === 'on'
                };
                
                try {
                  const { PropertyApiService } = await import('../lib/api/propertyApi');
                  await PropertyApiService.updateProperty(showEditPropertyModal.property.id, propertyData);
                  
                  setShowEditPropertyModal({ show: false });
                  await refetchPropertiesWithRooms();
                } catch (error) {
                  console.error('Error updating property:', error);
                  alert('Failed to update property. Please try again.');
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={showEditPropertyModal.property.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter property name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      defaultValue={showEditPropertyModal.property.location}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={showEditPropertyModal.property.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter property description (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      defaultValue={showEditPropertyModal.property.city}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      defaultValue={showEditPropertyModal.property.country}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      defaultValue={showEditPropertyModal.property.phoneNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={showEditPropertyModal.property.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Rooms *</label>
                    <input
                      type="number"
                      name="totalRooms"
                      required
                      min="1"
                      defaultValue={showEditPropertyModal.property.totalRooms}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Number of rooms"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time *</label>
                    <input
                      type="time"
                      name="checkInTime"
                      required
                      defaultValue={showEditPropertyModal.property.checkInTime}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time *</label>
                    <input
                      type="time"
                      name="checkOutTime"
                      required
                      defaultValue={showEditPropertyModal.property.checkOutTime}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    name="coverImageUrl"
                    defaultValue={showEditPropertyModal.property.coverImageUrl || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter image URL (optional)"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={showEditPropertyModal.property.isActive}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active (available for booking)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditPropertyModal({ show: false })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditRoomModal.show && showEditRoomModal.room && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Room</h2>
              <button
                onClick={() => setShowEditRoomModal({ show: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditRoom(formData);
            }} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    required
                    defaultValue={showEditRoomModal.room.name || showEditRoomModal.room.roomNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 101, 102"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    name="roomType"
                    required
                    defaultValue={showEditRoomModal.room.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="TWIN">Twin</option>
                    <option value="SUITE">Suite</option>
                    <option value="FAMILY">Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Night (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">LKR</span>
                    <input
                      type="number"
                      name="pricePerNight"
                      required
                      min="0.01"
                      step="0.01"
                      defaultValue={showEditRoomModal.room.pricePerNight || showEditRoomModal.room.price}
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Occupancy *
                  </label>
                  <input
                    type="number"
                    name="maxOccupancy"
                    required
                    min="1"
                    max="20"
                    defaultValue={showEditRoomModal.room.capacity || 2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of guests"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={showEditRoomModal.room.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Room description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  defaultValue={showEditRoomModal.room.imageUrl || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  id="isAvailable"
                  defaultChecked={showEditRoomModal.room.available || showEditRoomModal.room.isAvailable}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Room is available for booking
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditRoomModal({ show: false })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Addon Modal */}
      {showEditAddonModal.show && showEditAddonModal.addon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Addon</h2>
              <button
                onClick={() => setShowEditAddonModal({ show: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const addonData = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  price: parseFloat(formData.get('price') as string),
                  active: formData.get('active') === 'on'
                };
                
                try {
                  const { AddonApiService } = await import('../lib/api/addonApi');
                  await AddonApiService.updateAddon(showEditAddonModal.addon.id, addonData);
                  setShowEditAddonModal({ show: false });
                  refetchAddons();
                } catch (error) {
                  console.error('Error updating addon:', error);
                  alert('Failed to update addon. Please try again.');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Addon Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={showEditAddonModal.addon.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter addon name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={showEditAddonModal.addon.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter addon description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0.01"
                      step="0.01"
                      defaultValue={showEditAddonModal.addon.price}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={showEditAddonModal.addon.active}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active (available for selection)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditAddonModal({ show: false })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Addon
                  </button>
                  </div>
              </form>
                </div>
              </div>
            </div>
      )}

      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const adminData = {
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  password: formData.get('password') as string
                };
                
                try {
                  const { AdminUserApiService } = await import('../lib/api/adminUserApi');
                  await AdminUserApiService.createAdminUser(adminData);
                  setShowAddAdminModal(false);
                  // Refresh admin users list
                  window.location.reload();
                } catch (error) {
                  console.error('Error creating admin:', error);
                  alert('Failed to create admin user. Please try again.');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter admin name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                    Create Admin
              </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const propertyData = {
                  name: formData.get('name') as string,
                  description: (formData.get('description') as string) || undefined,
                  location: formData.get('location') as string,
                  city: formData.get('city') as string,
                  country: formData.get('country') as string,
                  phoneNumber: formData.get('phoneNumber') as string,
                  email: formData.get('email') as string,
                  totalRooms: parseInt(formData.get('totalRooms') as string),
                  checkInTime: formData.get('checkInTime') as string,
                  checkOutTime: formData.get('checkOutTime') as string,
                  coverImageUrl: (formData.get('coverImageUrl') as string) || undefined,
                  isActive: true
                };
                
                try {
                  const { PropertyApiService } = await import('../lib/api/propertyApi');
                  const createdProperty = await PropertyApiService.createProperty(propertyData);
                  
                  // Upload photos if any were selected
                  const photoFiles = formData.getAll('photos') as File[];
                  if (photoFiles.length > 0 && photoFiles[0].size > 0) {
                    const { PhotoApiService } = await import('../lib/api/photoApi');
                    for (const photoFile of photoFiles) {
                      if (photoFile.size > 0) {
                        await PhotoApiService.uploadPhoto({
                          propertyId: createdProperty.id,
                          caption: `Property photo for ${propertyData.name}`
                        }, photoFile);
                      }
                    }
                  }
                  
                  setShowPropertyModal(false);
                  await refetchPropertiesWithRooms();
                } catch (error) {
                  console.error('Error creating property:', error);
                  alert('Failed to create property. Please try again.');
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter property name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter property description (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Rooms *</label>
                  <input
                      type="number"
                      name="totalRooms"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Number of rooms"
                    />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time *</label>
                    <input
                      type="time"
                      name="checkInTime"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time *</label>
                    <input
                      type="time"
                      name="checkOutTime"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
              </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    name="coverImageUrl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter image URL (optional)"
                  />
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Photos</label>
                  <input
                    type="file"
                    name="photos"
                    accept="image/*"
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can select multiple photos. They will be uploaded after property creation.</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
              <button
                    type="button"
                    onClick={() => setShowPropertyModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                    Create Property
              </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking Edit Modal */}
      {showBookingEditModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Booking</h2>
              <button
                onClick={() => setShowBookingEditModal({ show: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Booking edit functionality will be implemented here.</p>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowBookingEditModal({ show: false })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Viewer Modal */}
      {showPaymentProofViewer.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Payment Proof - {showPaymentProofViewer.referenceId}</h2>
              <button
                onClick={() => setShowPaymentProofViewer({ show: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <img
                  src={`http://localhost:8080/api/payment-proofs/${showPaymentProofViewer.referenceId}/download`}
                  alt="Payment Proof"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                        }
                      }}
                    />
                <div style={{ display: 'none' }} className="text-gray-500 py-8">
                  <p>No payment proof found for this booking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUploadModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {showPhotoUploadModal.propertyId ? 'Upload Property Photos' : 'Upload Room Photos'}
              </h2>
              <button
                onClick={() => setShowPhotoUploadModal({ show: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const file = formData.get('photo') as File;
                const caption = formData.get('caption') as string;
                
                if (!file) {
                  alert('Please select a photo to upload.');
                  return;
                }
                
                try {
                  const { PhotoApiService } = await import('../lib/api/photoApi');
                  const photoData = {
                    propertyId: showPhotoUploadModal.propertyId,
                    roomId: showPhotoUploadModal.roomId,
                    caption: caption
                  };
                  await PhotoApiService.uploadPhoto(photoData, file);
                  setShowPhotoUploadModal({ show: false });
                  await refetchPropertiesWithRooms();
                } catch (error) {
                  console.error('Error uploading photo:', error);
                  alert('Failed to upload photo. Please try again.');
                }
              }} className="space-y-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Photo *</label>
                    <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                    <input
                    type="text"
                    name="caption"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Photo caption (optional)"
                    />
                  </div>

                <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => setShowPhotoUploadModal({ show: false })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Photo
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Room</h2>
              <button
                onClick={() => setShowAddRoomModal({ show: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const roomData = {
                  propertyId: showAddRoomModal.propertyId!,
                  roomType: formData.get('roomType') as string,
                  roomNumber: formData.get('roomNumber') as string,
                  description: formData.get('description') as string,
                  pricePerNight: parseFloat(formData.get('pricePerNight') as string),
                  maxOccupancy: parseInt(formData.get('maxOccupancy') as string),
                  isAvailable: formData.get('isAvailable') === 'on',
                  imageUrl: formData.get('imageUrl') as string
                };
                
                try {
                  const { RoomApiService } = await import('../lib/api/roomApi');
                  const { RoomAmenityApiService } = await import('../lib/api/roomAmenityApi');
                  const createdRoom = await RoomApiService.createRoom(showAddRoomModal.propertyId!, roomData);
                  
                  // Assign selected amenities to the room
                  const selectedAmenityIds = formData.getAll('amenities') as string[];
                  if (selectedAmenityIds.length > 0) {
                    for (const amenityId of selectedAmenityIds) {
                      try {
                        await RoomAmenityApiService.assignAmenityToRoom(createdRoom.id, amenityId);
                      } catch (amenityError) {
                        console.warn(`Failed to assign amenity ${amenityId} to room:`, amenityError);
                      }
                    }
                  }
                  
                  // Upload photos if any were selected
                  const photoFiles = formData.getAll('roomPhotos') as File[];
                  if (photoFiles.length > 0 && photoFiles[0].size > 0) {
                    const { PhotoApiService } = await import('../lib/api/photoApi');
                    for (const photoFile of photoFiles) {
                      if (photoFile.size > 0) {
                        await PhotoApiService.uploadPhoto({
                          roomId: createdRoom.id,
                          caption: `Room photo for ${roomData.roomNumber}`
                        }, photoFile);
                      }
                    }
                  }
                  
                  setShowAddRoomModal({ show: false });
                  await refetchPropertiesWithRooms();
                } catch (error) {
                  console.error('Error creating room:', error);
                  alert('Failed to create room. Please try again.');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                  <select
                    name="roomType"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select room type</option>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="TWIN">Twin</option>
                    <option value="SUITE">Suite</option>
                    <option value="DELUXE">Deluxe</option>
                  </select>
                  </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    name="roomNumber"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 101, A1, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Room description"
                  />
                    </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (LKR) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">LKR</span>
                      <input
                        type="number"
                        name="pricePerNight"
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy *</label>
                    <input
                      type="number"
                      name="maxOccupancy"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2"
                    />
                      </div>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Room image URL (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Photos</label>
                  <input
                    type="file"
                    name="roomPhotos"
                    accept="image/*"
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can select multiple photos. They will be uploaded after room creation.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Room Amenities</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {amenities.map((amenity) => (
                      <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="amenities"
                          value={amenity.id}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select amenities available in this room.</p>
                </div>

                <div className="flex items-center">
                    <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Available for booking
                  </label>
            </div>

                <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => setShowAddRoomModal({ show: false })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Room
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Amenity Modals */}
      <AmenityModal
        isOpen={showAddAmenityModal}
        onClose={() => setShowAddAmenityModal(false)}
        onSave={handleSaveAmenity}
        loading={amenityLoading}
      />

      <AmenityModal
        isOpen={showEditAmenityModal.show}
        onClose={() => setShowEditAmenityModal({ show: false })}
        onSave={handleSaveAmenity}
        amenity={showEditAmenityModal.amenity}
        loading={amenityLoading}
      />

      {/* Edit Admin Modal */}
      {showEditAdminModal.show && showEditAdminModal.admin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Admin</h2>
              <button
                onClick={() => setShowEditAdminModal({ show: false })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveAdmin(formData);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={showEditAdminModal.admin.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={showEditAdminModal.admin.email}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditAdminModal({ show: false })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Current User Profile Modal */}
      {showCurrentUserEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowCurrentUserEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveCurrentUser(formData);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentUser?.name || currentUser?.username || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={currentUser?.email || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                <input
                  type="url"
                  name="profilePicture"
                  defaultValue={currentUser?.profilePicture || ''}
                  placeholder="https://example.com/profile.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCurrentUserEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}