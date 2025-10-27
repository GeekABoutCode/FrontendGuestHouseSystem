import { useState, useEffect } from 'react';
import { PropertyApiService } from '../lib/api/propertyApi';
import { PhotoApiService } from '../lib/api/photoApi';
import { Property } from '../types';
import { transformPropertyFromBackend, transformPropertyDetailsFromBackend } from '../lib/dataTransformers';
import { useApiWithNotifications } from './useApi';

// Hook for fetching all properties
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const backendProperties = await PropertyApiService.getAllProperties();
      const transformedProperties = backendProperties.map(transformPropertyFromBackend);
      
      // Fetch photos for each property separately
      const propertiesWithPhotos = await Promise.all(
        transformedProperties.map(async (property) => {
          try {
            const photos = await PhotoApiService.getPhotosByProperty(property.id);
            const photoUrls = photos.map(photo => photo.url);
            return {
              ...property,
              images: photoUrls.length > 0 ? photoUrls : ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600']
            };
          } catch (photoError) {
            console.warn(`Failed to fetch photos for property ${property.id}:`, photoError);
            return {
              ...property,
              images: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600']
            };
          }
        })
      );
      
      setProperties(propertiesWithPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return { properties, loading, error, refetch: fetchProperties };
}

// Hook for fetching a single property with details
export function usePropertyDetails(propertyId: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertyDetails = async () => {
    if (!propertyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const backendProperty = await PropertyApiService.getPropertyById(propertyId);
      const transformedProperty = transformPropertyDetailsFromBackend(backendProperty);
      setProperty(transformedProperty);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  return { property, loading, error, refetch: fetchPropertyDetails };
}

// Hook for property management operations
export function usePropertyManagement() {
  const { loading, error, success, execute, clearNotifications } = useApiWithNotifications();

  const createProperty = async (propertyData: Partial<Property>) => {
    return execute(
      () => PropertyApiService.createProperty(propertyData as any),
      'Property created successfully!'
    );
  };

  const updateProperty = async (propertyId: string, updates: Partial<Property>) => {
    return execute(
      () => PropertyApiService.updateProperty(propertyId, updates as any),
      'Property updated successfully!'
    );
  };

  const deleteProperty = async (propertyId: string) => {
    return execute(
      () => PropertyApiService.deleteProperty(propertyId),
      'Property deleted successfully!'
    );
  };

  return {
    loading,
    error,
    success,
    createProperty,
    updateProperty,
    deleteProperty,
    clearNotifications
  };
}
