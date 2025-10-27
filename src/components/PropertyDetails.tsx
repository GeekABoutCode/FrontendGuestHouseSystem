import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, CheckCircle, Camera, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Property, Room } from '../types';
import RoomCard from './RoomCard';
import BookingModal from './BookingModal';
import ImageGallery from './ImageGallery';
import ReviewModal from './ReviewModal';
import { RoomApiService } from '../lib/api/roomApi';
import { PropertyApiService } from '../lib/api/propertyApi';
import { PhotoApiService } from '../lib/api/photoApi';
import { useReviewManagement } from '../hooks/useReviews';

interface PropertyDetailsProps {
  property?: Property; // Make property optional
}

export default function PropertyDetails({ property: propProperty }: PropertyDetailsProps) {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [property, setProperty] = useState<Property | null>(propProperty || null);
  const [loadingProperty, setLoadingProperty] = useState(!propProperty);
  
  const { createReview, loading: reviewLoading, error: reviewError } = useReviewManagement();

  const handleBack = () => {
    navigate('/');
  };

  // Load property data if not provided
  useEffect(() => {
    if (!property && propertyId) {
      const loadProperty = async () => {
        try {
          console.log('🏠 Loading property data for ID:', propertyId);
          setLoadingProperty(true);
          
          const propertyData = await PropertyApiService.getPropertyById(propertyId);
          console.log('📋 Property data received:', propertyData);
          
          // Transform backend property to frontend format
          const transformedProperty: Property = {
            id: propertyData.id,
            name: propertyData.name,
            description: propertyData.description || '',
            location: propertyData.location,
            city: propertyData.city,
            country: propertyData.country,
            isActive: propertyData.isActive,
            phoneNumber: propertyData.phoneNumber,
            totalRooms: propertyData.totalRooms,
            email: propertyData.email,
            checkInTime: propertyData.checkInTime,
            checkOutTime: propertyData.checkOutTime,
            coverImageUrl: propertyData.coverImageUrl || '',
            images: [], // Will be populated by separate photo API call
            rating: 4.0, // Default rating
            pricePerNight: 0, // Default price
            amenities: [], // Default empty amenities
            rooms: [] // Will be loaded separately
          };
          
          // Fetch photos for this property
          try {
            const photos = await PhotoApiService.getPhotosByProperty(propertyData.id);
            const photoUrls = photos.map(photo => photo.url);
            transformedProperty.images = photoUrls.length > 0 
              ? photoUrls 
              : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='];
          } catch (photoError) {
            console.warn(`Failed to fetch photos for property ${propertyData.id}:`, photoError);
            transformedProperty.images = ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='];
          }
          
          console.log('🔄 Transformed property:', transformedProperty);
          setProperty(transformedProperty);
        } catch (error) {
          console.error('❌ Failed to load property:', error);
          navigate('/'); // Redirect to home if property not found
        } finally {
          setLoadingProperty(false);
        }
      };

      loadProperty();
    }
  }, [property, propertyId, navigate]);

  // Load rooms from database when component mounts
  useEffect(() => {
    if (!property) return; // Don't load rooms if we don't have property data yet
    
    const loadRooms = async () => {
      try {
        console.log('🏠 Loading rooms for property:', property.name, property.id);
        setLoadingRooms(true);
        
        const backendRooms = await RoomApiService.getRoomsByPropertyId(property.id);
        console.log('📋 Backend rooms received:', backendRooms);
        
        
        // Transform backend rooms to frontend format and fetch photos
        const transformedRooms: Room[] = await Promise.all(
          backendRooms.map(async (room) => {
            const transformedRoom: Room = {
              id: room.id,
              roomNumber: room.roomNumber,
              type: room.roomType,
              capacity: (() => {
                // Try to get stored capacity from localStorage (updated when room is edited)
                const storedCapacity = localStorage.getItem(`room_capacity_${room.id}`);
                return storedCapacity ? parseInt(storedCapacity) : 2;
              })(),
              pricePerNight: room.pricePerNight,
              isAvailable: room.isAvailable,
              amenities: [], // Default empty since it's not in RoomDto
              images: [], // Will be populated by separate photo API call
              // Legacy fields for backward compatibility
              name: room.roomNumber,
              price: room.pricePerNight,
              available: room.isAvailable
            };
            
            // Fetch photos for this room
            try {
              const photos = await PhotoApiService.getPhotosByRoom(room.id);
              const photoUrls = photos.map(photo => photo.url);
              transformedRoom.images = photoUrls.length > 0 
                ? photoUrls 
                : ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600'];
            } catch (photoError) {
              console.warn(`Failed to fetch photos for room ${room.id}:`, photoError);
              transformedRoom.images = ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600'];
            }
            
            return transformedRoom;
          })
        );
        
        console.log('🔄 Transformed rooms:', transformedRooms);
        setRooms(transformedRooms);
      } catch (error) {
        console.error('❌ Failed to load rooms:', error);
        // Fallback to context rooms if API fails
        setRooms(property.rooms || []);
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, [property]);

  const availableRooms = rooms.filter(room => room.available === true);

  const handleBookNow = (rooms: Room[]) => {
    setSelectedRooms(rooms);
    setShowBookingModal(true);
  };

  const handleCreateReview = async (reviewData: { referenceId: string; rating: number; comment?: string }) => {
    try {
      await createReview(reviewData);
      // Review creation success is handled by the hook's notification system
    } catch (error) {
      console.error('Error creating review:', error);
      // Error handling is done by the hook's notification system
    }
  };

  // Show loading state if property is loading
  if (loadingProperty || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-gray-600 mt-4">Loading property...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative">
            <div className="relative cursor-pointer" onClick={() => setShowImageGallery(true)}>
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-64 md:h-96 object-cover"
            />
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                <Camera className="w-4 h-4" />
                <span className="text-sm">{property.images.length} photos</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {property.name}
                  </h1>
                  <div className="flex items-center text-white/90 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="text-white font-medium">{property.rating}</span>
                    <span className="text-white/80 ml-2">Excellent Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Property</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {property.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Rooms</span>
                  <span className="font-semibold">{rooms.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available Rooms</span>
                      <span className="font-semibold text-green-600">{availableRooms.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Max Capacity</span>
                      <span className="font-semibold">
                    {rooms.reduce((total, room) => total + room.capacity, 0)} guests
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookNow([])}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Book Now
                </button>
                
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Write a Review</span>
                </button>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Rooms</h2>
              
              {/* Debug Info */}
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Debug Info:</strong><br/>
                  Loading: {loadingRooms ? 'Yes' : 'No'}<br/>
                  Total Rooms: {rooms.length}<br/>
                  Available Rooms: {availableRooms.length}<br/>
                  Property Rooms (from context): {property.rooms?.length || 0}
                </p>
              </div>
              
              {loadingRooms ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <div className="text-gray-600 mt-4">Loading rooms...</div>
                </div>
              ) : availableRooms.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRooms.map((room) => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      onBook={() => handleBookNow([room])}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No rooms available at the moment</div>
                  <div className="text-gray-400 mt-2">Please check back later or contact us directly</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          property={property}
          rooms={rooms}
          selectedRooms={selectedRooms}
          onClose={() => setShowBookingModal(false)}
        />
      )}
      
      {showImageGallery && (
        <ImageGallery
          images={property.images}
          title={property.name}
          onClose={() => setShowImageGallery(false)}
        />
      )}
      
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleCreateReview}
          propertyName={property.name}
          loading={reviewLoading}
          error={reviewError}
        />
      )}
    </div>
  );
}