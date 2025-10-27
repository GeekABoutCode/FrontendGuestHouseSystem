import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Property, Booking, User } from '../types';
import { useProperties } from '../hooks/useProperties';
import { useBookings as useBookingsHook } from '../hooks/useBookings';

interface AppState {
  properties: Property[];
  bookings: Booking[];
  currentUser: User | null;
  isAdminLoggedIn: boolean;
  selectedProperty: Property | null;
  currentBooking: Booking | null;
  // API state
  propertiesLoading: boolean;
  propertiesError: string | null;
  bookingsLoading: boolean;
  bookingsError: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ADMIN_LOGIN'; payload: boolean }
  | { type: 'SET_SELECTED_PROPERTY'; payload: Property | null }
  | { type: 'SET_CURRENT_BOOKING'; payload: Booking | null }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<Booking> } }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: { id: string; updates: Partial<Property> } }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'ADD_ROOM'; payload: { propertyId: string; room: any } }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'SET_PROPERTIES_LOADING'; payload: boolean }
  | { type: 'SET_PROPERTIES_ERROR'; payload: string | null }
  | { type: 'SET_BOOKINGS_LOADING'; payload: boolean }
  | { type: 'SET_BOOKINGS_ERROR'; payload: string | null }
  | { type: 'REFRESH_PROPERTIES' }
  | { type: 'REFRESH_BOOKINGS' }
  | { type: 'REFRESH_ADMIN_USERS' };

const initialState: AppState = {
  properties: [],
  bookings: [],
  currentUser: { id: '1', name: 'Guest User', email: 'guest@example.com', role: 'user' },
  isAdminLoggedIn: false,
  selectedProperty: null,
  currentBooking: null,
  propertiesLoading: false,
  propertiesError: null,
  bookingsLoading: false,
  bookingsError: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ADMIN_LOGIN':
      return { ...state, isAdminLoggedIn: action.payload };
    case 'SET_SELECTED_PROPERTY':
      return { ...state, selectedProperty: action.payload };
    case 'SET_CURRENT_BOOKING':
      return { ...state, currentBooking: action.payload };
    case 'ADD_BOOKING':
      const newBookings = [...state.bookings, action.payload];
      // Save to localStorage for guest users
      if (!state.isAdminLoggedIn) {
        localStorage.setItem('guestBookings', JSON.stringify(newBookings));
      }
      return { ...state, bookings: newBookings };
    case 'UPDATE_BOOKING':
      const updatedBookings = state.bookings.map(booking =>
        booking.id === action.payload.id
          ? { ...booking, ...action.payload.updates }
          : booking
      );
      // Save to localStorage for guest users
      if (!state.isAdminLoggedIn) {
        localStorage.setItem('guestBookings', JSON.stringify(updatedBookings));
      }
      return { ...state, bookings: updatedBookings };
    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(property =>
          property.id === action.payload.id
            ? { ...property, ...action.payload.updates }
            : property
        ),
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(property => property.id !== action.payload),
      };
    case 'ADD_ROOM':
      return {
        ...state,
        properties: state.properties.map(property =>
          property.id === action.payload.propertyId
            ? { ...property, rooms: [...property.rooms, action.payload.room] }
            : property
        ),
      };
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    case 'SET_PROPERTIES_LOADING':
      return { ...state, propertiesLoading: action.payload };
    case 'SET_PROPERTIES_ERROR':
      return { ...state, propertiesError: action.payload };
    case 'SET_BOOKINGS_LOADING':
      return { ...state, bookingsLoading: action.payload };
    case 'SET_BOOKINGS_ERROR':
      return { ...state, bookingsError: action.payload };
    case 'REFRESH_PROPERTIES':
      // This will trigger a refetch in the useEffect
      return state;
    case 'REFRESH_BOOKINGS':
      // This will trigger a refetch in the useEffect
      return state;
    case 'REFRESH_ADMIN_USERS':
      // This will trigger a refetch in the useEffect
      return state;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Fetch properties from API
  const { 
    properties: apiProperties, 
    loading: propertiesLoading, 
    error: propertiesError,
    refetch: refetchProperties 
  } = useProperties();

  // Fetch bookings from API (only for admin)
  const { 
    bookings: apiBookings, 
    loading: bookingsLoading, 
    error: bookingsError,
    refetch: refetchBookings 
  } = useBookingsHook(state.isAdminLoggedIn);

  // Update state when API data changes
  useEffect(() => {
    if (apiProperties) {
      dispatch({ type: 'SET_PROPERTIES', payload: apiProperties });
    }
  }, [apiProperties]);

  // Only fetch bookings for admin users
  useEffect(() => {
    if (state.isAdminLoggedIn && apiBookings) {
      dispatch({ type: 'SET_BOOKINGS', payload: apiBookings });
    }
  }, [apiBookings, state.isAdminLoggedIn]);

  // Load bookings from localStorage on app start (for guest users)
  useEffect(() => {
    if (!state.isAdminLoggedIn) {
      const storedBookings = localStorage.getItem('guestBookings');
      if (storedBookings) {
        try {
          const parsedBookings = JSON.parse(storedBookings);
          dispatch({ type: 'SET_BOOKINGS', payload: parsedBookings });
        } catch (error) {
          console.error('Failed to parse stored bookings:', error);
        }
      }
    }
  }, [state.isAdminLoggedIn]);

  useEffect(() => {
    dispatch({ type: 'SET_PROPERTIES_LOADING', payload: propertiesLoading });
  }, [propertiesLoading]);

  useEffect(() => {
    dispatch({ type: 'SET_PROPERTIES_ERROR', payload: propertiesError });
  }, [propertiesError]);

  useEffect(() => {
    dispatch({ type: 'SET_BOOKINGS_LOADING', payload: bookingsLoading });
  }, [bookingsLoading]);

  useEffect(() => {
    dispatch({ type: 'SET_BOOKINGS_ERROR', payload: bookingsError });
  }, [bookingsError]);

  // Handle refresh actions
  useEffect(() => {
    if (state.propertiesLoading === false && state.propertiesError === null) {
      // Check if we need to refresh properties
      if (state.properties.length === 0) {
        refetchProperties();
      }
    }
  }, [state.propertiesLoading, state.propertiesError, state.properties.length, refetchProperties]);

  useEffect(() => {
    if (state.isAdminLoggedIn && state.bookingsLoading === false && state.bookingsError === null) {
      // Check if we need to refresh bookings
      if (state.bookings.length === 0) {
        refetchBookings();
      }
    }
  }, [state.isAdminLoggedIn, state.bookingsLoading, state.bookingsError, state.bookings.length, refetchBookings]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
