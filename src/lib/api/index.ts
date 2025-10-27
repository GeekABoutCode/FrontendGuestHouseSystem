// Export all API services
export { apiClient, ApiError, handleApiError } from '../api';

export * from './propertyApi';
export * from './bookingApi';
export * from './bookingRoomApi';
export * from './bookingStatusHistoryApi';
export * from './temporaryTokenApi';
export * from './authApi';
export * from './roomApi';
export * from './roomAmenityApi';
export * from './addonApi';

// Re-export service classes for convenience
export { PropertyApiService } from './propertyApi';
export { BookingApiService } from './bookingApi';
export { BookingRoomApiService } from './bookingRoomApi';
export { BookingStatusHistoryApiService } from './bookingStatusHistoryApi';
export { TemporaryTokenApiService } from './temporaryTokenApi';
export { AuthApiService } from './authApi';
export { RoomApiService } from './roomApi';
export { RoomAmenityApiService } from './roomAmenityApi';
export { AddonApiService } from './addonApi';
