// Updated types to match backend DTOs
export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  country: string;
  isActive: boolean;
  phoneNumber: string;
  totalRooms: number;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  coverImageUrl: string;
  images: string[];
  pendingImages?: File[]; // For temporary storage before upload
  rating: number;
  pricePerNight: number;
  amenities: string[];
  rooms: Room[];
}

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  amenities: string[];
  images: string[];
  pendingImages?: File[]; // For temporary storage before upload
  description?: string; // Add description field
  // Legacy fields for backward compatibility
  name?: string;
  price?: number;
  available?: boolean;
}

// Extended interfaces for form states
export interface PropertyFormData extends Partial<Property> {
  pendingImages?: File[];
}

export interface RoomFormData extends Partial<Room> {
  pendingImages?: File[];
}

export interface Booking {
  id: string;
  referenceId: string;
  propertyId: string;
  propertyName: string;
  roomIds: string[];
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  selectedAmenities?: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt?: string;
  paymentProof?: string;
  notes?: string;
  token?: string;
  isPaid?: boolean;
  confirmedAt?: string;
  expiredAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// Addon interfaces
export interface Addon {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddonSelection {
  addon: Addon;
  selected: boolean;
}

// API Response types for backend integration
export interface PropertySummary {
  id: string;
  name: string;
  description?: string;
  location: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  coverImageUrl?: string;
}

export interface RoomLineItem {
  roomId: string;
  roomNumber: string;
  noOfNights: number;
  pricePerNight: number;
  lineTotal: number;
}

export interface BookingAdminResponse {
  bookingId: string;
  property: PropertySummary;
  rooms: RoomLineItem[];
  referenceId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  noOfRooms: number;
  noOfGuests: number;
  totalPrice: number;
  isPaid: boolean;
  confirmedAt?: string;
  expiredAt?: string;
  notes?: string;
  token: string;
}

export interface BookingGuestResponse {
  bookingId: string;
  property: PropertySummary;
  rooms: RoomLineItem[];
  referenceId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  noOfRooms: number;
  noOfGuests: number;
  totalPrice: number;
  confirmedAt?: string;
  notes?: string;
  token: string;
}