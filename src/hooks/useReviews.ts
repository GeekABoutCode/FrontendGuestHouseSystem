import { useState, useEffect } from 'react';
import { ReviewApiService, ReviewResponse, PropertyRatingResponse, ReviewStatistics } from '../lib/api/reviewApi';

// Hook for fetching reviews
export function useReviews() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const backendReviews = await ReviewApiService.getAllReviews();
      setReviews(backendReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return { reviews, loading, error, refetch: fetchReviews };
}

// Hook for fetching reviews by property
export function useReviewsByProperty(propertyId: string) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewsByProperty = async () => {
    if (!propertyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const backendReviews = await ReviewApiService.getReviewsByProperty(propertyId);
      setReviews(backendReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsByProperty();
  }, [propertyId]);

  return { reviews, loading, error, refetch: fetchReviewsByProperty };
}

// Hook for fetching property ratings
export function usePropertyRatings() {
  const [ratings, setRatings] = useState<PropertyRatingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertyRatings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const backendRatings = await ReviewApiService.getAllPropertyRatings();
      setRatings(backendRatings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch property ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyRatings();
  }, []);

  return { ratings, loading, error, refetch: fetchPropertyRatings };
}

// Hook for review management operations
export function useReviewManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReview = async (reviewData: { referenceId: string; rating: number; comment?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating review with data:', reviewData);
      const result = await ReviewApiService.createReview(reviewData);
      console.log('Review created successfully:', result);
      return result;
    } catch (err) {
      console.error('Error creating review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (referenceId: string, reviewData: { rating: number; comment?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ReviewApiService.updateMyReview(referenceId, { referenceId, ...reviewData });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (referenceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await ReviewApiService.deleteReview(referenceId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchReviews = async (guestName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ReviewApiService.searchReviewsByGuestName(guestName);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search reviews';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    searchReviews
  };
}
