import { apiClient } from '../api';

// Review API Types
export interface ReviewRequest {
  referenceId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  referenceId: string;
  guestName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  propertyName: string;
}

export interface PropertyRatingResponse {
  propertyId: string;
  propertyName: string;
  averageRating: number;
  totalReviews: number;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

// Review API Service
export class ReviewApiService {
  // ====================== ADMIN ENDPOINTS ======================
  
  // Get all reviews (admin only)
  static async getAllReviews(): Promise<ReviewResponse[]> {
    return apiClient.get<ReviewResponse[]>('/reviews/admin');
  }

  // Get review by reference ID (admin only)
  static async getReviewByReferenceId(referenceId: string): Promise<ReviewResponse> {
    return apiClient.get<ReviewResponse>(`/reviews/admin/reference/${referenceId}`);
  }

  // Get reviews by property ID (admin only)
  static async getReviewsByProperty(propertyId: string): Promise<ReviewResponse[]> {
    return apiClient.get<ReviewResponse[]>(`/reviews/admin/property/${propertyId}`);
  }

  // Search reviews by guest name (admin only)
  static async searchReviewsByGuestName(guestName: string): Promise<ReviewResponse[]> {
    return apiClient.get<ReviewResponse[]>(`/reviews/admin/search?guestName=${encodeURIComponent(guestName)}`);
  }

  // Delete review by reference ID (admin only)
  static async deleteReview(referenceId: string): Promise<void> {
    return apiClient.delete<void>(`/reviews/admin/${referenceId}`);
  }

  // Get all property ratings (admin only)
  static async getAllPropertyRatings(): Promise<PropertyRatingResponse[]> {
    return apiClient.get<PropertyRatingResponse[]>('/reviews/admin/property-ratings');
  }

  // ====================== GUEST ENDPOINTS ======================

  // Create a new review (guest)
  static async createReview(reviewData: ReviewRequest): Promise<ReviewResponse> {
    return apiClient.post<ReviewResponse>('/reviews/guest', reviewData);
  }

  // Get my review by reference ID (guest)
  static async getMyReview(referenceId: string): Promise<ReviewResponse> {
    return apiClient.get<ReviewResponse>(`/reviews/guest/${referenceId}`);
  }

  // Update my review by reference ID (guest)
  static async updateMyReview(referenceId: string, reviewData: ReviewRequest): Promise<ReviewResponse> {
    return apiClient.put<ReviewResponse>(`/reviews/guest/${referenceId}`, reviewData);
  }

  // Delete my review by reference ID (guest)
  static async deleteMyReview(referenceId: string): Promise<void> {
    return apiClient.delete<void>(`/reviews/guest/${referenceId}`);
  }

  // ====================== PUBLIC ENDPOINTS ======================

  // Get property rating (public)
  static async getPropertyRating(propertyId: string): Promise<PropertyRatingResponse> {
    return apiClient.get<PropertyRatingResponse>(`/reviews/public/property/${propertyId}/rating`);
  }

  // Get property rating by booking reference (public)
  static async getPropertyRatingByBookingReference(referenceId: string): Promise<PropertyRatingResponse> {
    return apiClient.get<PropertyRatingResponse>(`/reviews/public/booking/${referenceId}/property-rating`);
  }

  // Get review statistics (public)
  static async getReviewStatistics(): Promise<ReviewStatistics> {
    return apiClient.get<ReviewStatistics>('/reviews/public/statistics');
  }
}

