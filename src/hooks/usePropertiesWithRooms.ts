import { useState, useEffect } from 'react';
import { PropertyApiService } from '../lib/api/propertyApi';
import { RoomApiService } from '../lib/api/roomApi';
import { Property } from '../types';
import { transformPropertyFromBackend } from '../lib/dataTransformers';

// Hook for fetching properties with their rooms
export function usePropertiesWithRooms() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertiesWithRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading properties with rooms...');
      
      // First, load all properties (basic list)
      const backendProperties = await PropertyApiService.getAllProperties();
      
      // Then, for each property, load its detailed information (which includes photos)
      const propertiesWithDetails = await Promise.all(
        backendProperties.map(async (property) => {
          try {
            const detailedProperty = await PropertyApiService.getPropertyById(property.id);
            return transformPropertyFromBackend(detailedProperty);
          } catch (error) {
            console.error(`Failed to load details for property ${property.name}:`, error);
            // Fallback to basic property data with manual photo fetching
            let propertyImages = property.coverImageUrl ? [property.coverImageUrl] : ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600'];
            
            // Fetch additional photos for this property
            try {
              const propertyPhotosResponse = await fetch(`http://localhost:8080/api/photos/property/${property.id}`);
              if (propertyPhotosResponse.ok) {
                const propertyPhotos = await propertyPhotosResponse.json();
                console.log('📸 Fetched property photos for', property.name, ':', propertyPhotos);
                const propertyPhotoUrls = propertyPhotos.map((photo: any) => photo.url);
                propertyImages = [...propertyImages, ...propertyPhotoUrls];
              }
            } catch (propertyPhotoError) {
              console.log('ℹ️ No additional photos found for property', property.name, ':', propertyPhotoError);
            }
            
            const basicProperty = transformPropertyFromBackend(property);
            return {
              ...basicProperty,
              images: propertyImages
            };
          }
        })
      );
      
      const transformedProperties = propertiesWithDetails;
      
      console.log('Loaded properties:', transformedProperties);
      
      // Then, for each property, load its rooms
      const propertiesWithRooms = await Promise.all(
        transformedProperties.map(async (property) => {
          try {
            console.log(`Loading rooms for property: ${property.name}`);
            const rooms = await RoomApiService.getRoomsByPropertyId(property.id);
            console.log(`Loaded ${rooms.length} rooms for ${property.name}:`, rooms);
            
            // For each room, fetch its photos separately
            const roomsWithPhotos = await Promise.all(
              rooms.map(async (room) => {
                let roomImages = room.coverPageUrl ? [room.coverPageUrl] : ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600'];
                
                // Fetch additional photos for this room
                try {
                  const roomPhotosResponse = await fetch(`http://localhost:8080/api/photos/room/${room.id}`);
                  if (roomPhotosResponse.ok) {
                    const roomPhotos = await roomPhotosResponse.json();
                    console.log('📸 Fetched room photos for', room.roomNumber, ':', roomPhotos);
                    const roomPhotoUrls = roomPhotos.map((photo: any) => photo.url);
                    roomImages = [...roomImages, ...roomPhotoUrls];
                  }
                } catch (roomPhotoError) {
                  console.log('ℹ️ No additional photos found for room', room.roomNumber, ':', roomPhotoError);
                }
                
                return {
                  ...room,
                  images: roomImages
                };
              })
            );
            
            // Transform backend rooms to frontend format
            const transformedRooms = roomsWithPhotos.map(room => {
              // Handle different possible types for isAvailable
              const available = Boolean(room.isAvailable);
              
              // Try to get stored capacity from localStorage (updated when room is edited)
              const storedCapacity = localStorage.getItem(`room_capacity_${room.id}`);
              const capacity = storedCapacity ? parseInt(storedCapacity) : 2;
              
              return {
                id: room.id,
                roomNumber: room.roomNumber,
                type: room.roomType,
                capacity: capacity, // Use stored capacity or default to 2
                pricePerNight: room.pricePerNight,
                isAvailable: available,
                amenities: [], // Default empty since it's not in RoomDto
                images: room.images,
                // Legacy fields for backward compatibility
                name: room.roomNumber,
                available: available
              };
            });
            
            return {
              ...property,
              rooms: transformedRooms
            };
          } catch (error) {
            console.error(`Failed to load rooms for property ${property.name}:`, error);
            return {
              ...property,
              rooms: [] // Return property with empty rooms if loading fails
            };
          }
        })
      );
      
      console.log('Properties with rooms loaded:', propertiesWithRooms);
      setProperties(propertiesWithRooms);
    } catch (err) {
      console.error('Failed to load properties with rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertiesWithRooms();
  }, []);

  return { properties, loading, error, refetch: fetchPropertiesWithRooms };
}
