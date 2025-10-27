import React, { useState } from 'react';
import { MapPin, Star, Users, Wifi, Car, ChevronLeft, ChevronRight, Camera, MessageSquare } from 'lucide-react';
import { Property } from '../types';
import ReviewModal from './ReviewModal';
import { useReviewManagement } from '../hooks/useReviews';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export default function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { createReview, loading: reviewLoading, error: reviewError } = useReviewManagement();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
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

  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReviewModal(true);
  };
  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => onSelect(property)}
      >
      <div className="relative overflow-hidden">
        <img
          src={property.images[currentImageIndex] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='}
          alt={property.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Photo counter */}
        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full flex items-center space-x-1">
          <Camera className="w-3 h-3" />
          <span className="text-xs">{currentImageIndex + 1}/{property.images.length}</span>
        </div>
        
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{property.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {property.name}
          </h3>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{property.rooms.reduce((total, room) => total + room.capacity, 0)} guests</span>
            </div>
            <div className="flex items-center">
              <span>{property.rooms.length} rooms</span>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <div key={index} className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                {amenity === 'WiFi' && <Wifi className="w-3 h-3 text-blue-600" />}
                {amenity === 'Parking' && <Car className="w-3 h-3 text-blue-600" />}
                {!['WiFi', 'Parking'].includes(amenity) && (
                  <span className="text-xs font-medium text-blue-600">
                    {amenity.charAt(0)}
                  </span>
                )}
              </div>
            ))}
            {property.amenities.length > 3 && (
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{property.amenities.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleReviewClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write Review</span>
          </button>
        </div>
      </div>
    </div>
    
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
    </>
  );
}