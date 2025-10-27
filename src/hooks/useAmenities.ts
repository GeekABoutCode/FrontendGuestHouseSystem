import { useState, useEffect } from 'react';
import { AmenityApiService, AmenityResponse } from '../lib/api/amenityApi';
import { useApiWithNotifications } from './useApi';

// Hook for fetching all amenities
export function useAmenities() {
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAmenities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const backendAmenities = await AmenityApiService.getAllAmenities();
      setAmenities(backendAmenities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  return { amenities, loading, error, refetch: fetchAmenities };
}

// Hook for amenity management operations
export function useAmenityManagement() {
  const { loading, error, success, execute, clearNotifications } = useApiWithNotifications();

  const createAmenity = async (amenityData: { name: string; description?: string; iconUrl?: string; isActive?: boolean }) => {
    return execute(
      () => AmenityApiService.createAmenity(amenityData),
      'Amenity created successfully!'
    );
  };

  const deleteAmenity = async (amenityId: string) => {
    return execute(
      () => AmenityApiService.deleteAmenity(amenityId),
      'Amenity deleted successfully!'
    );
  };

  return {
    loading,
    error,
    success,
    createAmenity,
    deleteAmenity,
    clearNotifications
  };
}
