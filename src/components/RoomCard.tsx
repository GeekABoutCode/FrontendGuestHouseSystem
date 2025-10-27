import React, { useState } from 'react';
import { Users, CheckCircle, Camera } from 'lucide-react';
import { Room } from '../types';
import ImageGallery from './ImageGallery';

interface RoomCardProps {
  room: Room;
  onBook: () => void;
}

export default function RoomCard({ room, onBook }: RoomCardProps) {
  const [showImageGallery, setShowImageGallery] = useState(false);

  return (
    <>
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="relative cursor-pointer" onClick={() => setShowImageGallery(true)}>
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-48 object-cover"
        />
          {room.images.length > 1 && (
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span className="text-xs">{room.images.length}</span>
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
          <span className="text-sm font-semibold text-gray-900">LKR {room.price}/night</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm">{room.capacity}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {room.type}
          </span>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Room Amenities</h4>
          <div className="space-y-1">
            {room.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                {amenity}
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={onBook}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Select Room
        </button>
      </div>
    </div>
      
      {showImageGallery && (
        <ImageGallery
          images={room.images}
          title={room.name}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </>
  );
}