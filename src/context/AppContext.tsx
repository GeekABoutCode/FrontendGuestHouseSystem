import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Property, Booking, User } from '../types';
import { properties, bookings } from '../data/mockData';
import { useProperties, useBookings } from '../hooks/useProperties';
import { useBookings as useBookingsHook } from '../hooks/useBookings';

interface AppState {
  properties: Property[];
  bookings: Booking[];
  currentUser: User | null;
  isAdminLoggedIn: boolean;
  selectedProperty: Property | null;
  currentBooking: Booking | null;
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
  | { type: 'ADD_ROOM'; payload: { propertyId: string; room: Room } };

const initialState: AppState = {
  properties,
  bookings,
  currentUser: { id: '1', name: 'Guest User', email: 'guest@example.com', role: 'user' },
  isAdminLoggedIn: false,
  selectedProperty: null,
  currentBooking: null,
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
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id
            ? { ...booking, ...action.payload.updates }
            : booking
        ),
      };
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