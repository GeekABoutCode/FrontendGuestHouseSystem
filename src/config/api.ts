// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Environment-specific configurations
export const getApiBaseUrl = () => {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return 'http://localhost:8080/api';
    case 'production':
      return 'https://your-production-api.com/api';
    case 'staging':
      return 'https://your-staging-api.com/api';
    default:
      return 'http://localhost:8080/api';
  }
};

// API endpoints
export const API_ENDPOINTS = {
  PROPERTIES: {
    LIST: '/property/',
    DETAIL: (id: string) => `/property/${id}`,
    CREATE: '/property/',
    UPDATE: (id: string) => `/property/${id}`,
    DELETE: (id: string) => `/property/${id}`,
  },
  BOOKINGS: {
    ADMIN: {
      LIST: '/bookings/admin',
      DETAIL: (id: string) => `/bookings/admin/${id}`,
      CREATE: '/bookings/admin/create',
      UPDATE: (id: string) => `/bookings/admin/${id}`,
      CONFIRM: (id: string) => `/bookings/admin/${id}/confirm`,
      CANCEL: (id: string) => `/bookings/admin/${id}/cancel`,
      ATTACH_ROOMS: (id: string) => `/bookings/admin/${id}/attach-rooms`,
      SUMMARY: '/bookings/admin/summary',
    },
    GUEST: {
      CREATE: '/bookings/guest/create',
      UPDATE: (id: string) => `/bookings/guest/${id}`,
      PATCH: (id: string) => `/bookings/guest/${id}`,
      AMEND: (id: string) => `/bookings/guest/${id}/amend`,
      CANCEL: (id: string) => `/bookings/guest/${id}/cancel`,
      BY_TOKEN: (token: string) => `/bookings/guest/${token}`,
    },
  },
  BOOKING_ROOMS: {
    BY_BOOKING: (bookingId: string) => `/booking-rooms/${bookingId}`,
    MAP: '/booking-rooms/map',
  },
  BOOKING_STATUS_HISTORY: {
    BY_BOOKING: (id: string) => `/admin/bookings/${id}/status-history`,
    LIST: '/admin/bookings/status-history',
    CURRENT: '/admin/bookings/status-history/current',
  },
  TEMPORARY_TOKENS: {
    BY_TOKEN: (token: string) => `/admin/temporary-token/by-token/${token}`,
    BY_BOOKING: (bookingId: string) => `/admin/temporary-token/by-booking/${bookingId}`,
    ALL: '/admin/temporary-token/all-tokens',
    DEACTIVATE: (bookingId: string) => `/admin/temporary-token/${bookingId}/deactivate`,
    DEACTIVATE_ALL: '/admin/temporary-token/deactivate-all',
    REGENERATE: '/admin/temporary-token/regenerate',
  },
};
