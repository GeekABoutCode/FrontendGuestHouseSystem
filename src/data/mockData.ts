import { Property, Booking } from '../types';

export const properties: Property[] = [
  {
    id: '1',
    name: 'Seaside Villa Resort',
    description: 'Luxury beachfront resort with stunning ocean views and world-class amenities',
    location: 'Malibu, California',
    images: [
      'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.8,
    pricePerNight: 250,
    amenities: ['Pool', 'Spa', 'Beach Access', 'WiFi', 'Restaurant', 'Gym'],
    rooms: [
      {
        id: '1-1',
        name: 'Ocean View Suite',
        type: 'Suite',
        capacity: 4,
        price: 350,
        amenities: ['Ocean View', 'Balcony', 'Kitchenette', 'WiFi'],
        images: [
          'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600',
          'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=600',
          'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        available: true
      },
      {
        id: '1-2',
        name: 'Deluxe Double Room',
        type: 'Double',
        capacity: 2,
        price: 250,
        amenities: ['Garden View', 'WiFi', 'Mini Bar'],
        images: [
          'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=600',
          'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        available: true
      },
      {
        id: '1-3',
        name: 'Standard Single Room',
        type: 'Single',
        capacity: 1,
        price: 180,
        amenities: ['WiFi', 'Air Conditioning'],
        images: [
          'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        available: false
      }
    ]
  },
  {
    id: '2',
    name: 'Mountain Lodge Retreat',
    description: 'Cozy mountain retreat perfect for nature lovers and adventure seekers',
    location: 'Aspen, Colorado',
    images: [
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1029613/pexels-photo-1029613.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.6,
    pricePerNight: 180,
    amenities: ['Fireplace', 'Hiking Trails', 'WiFi', 'Restaurant', 'Spa'],
    rooms: [
      {
        id: '2-1',
        name: 'Mountain View Cabin',
        type: 'Cabin',
        capacity: 6,
        price: 300,
        amenities: ['Mountain View', 'Fireplace', 'Full Kitchen', 'WiFi'],
        images: [
          'https://images.pexels.com/photos/1029613/pexels-photo-1029613.jpeg?auto=compress&cs=tinysrgb&w=600',
          'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        available: true
      },
      {
        id: '2-2',
        name: 'Cozy Double Room',
        type: 'Double',
        capacity: 2,
        price: 180,
        amenities: ['Forest View', 'WiFi', 'Heating'],
        images: [
          'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        available: true
      }
    ]
  },
  {
    id: '3',
    name: 'Urban Boutique Hotel',
    description: 'Modern boutique hotel in the heart of the city with contemporary design',
    location: 'Downtown Los Angeles',
    images: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.7,
    pricePerNight: 200,
    amenities: ['Rooftop Bar', 'Gym', 'WiFi', 'Business Center', 'Concierge'],
    rooms: [
      {
        id: '3-1',
        name: 'Executive Suite',
        type: 'Suite',
        capacity: 3,
        price: 280,
        amenities: ['City View', 'Work Desk', 'Mini Bar', 'WiFi'],
        images: [
          'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=600',
          'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        available: true
      },
      {
        id: '3-2',
        name: 'Standard King Room',
        type: 'King',
        capacity: 2,
        price: 200,
        amenities: ['City View', 'WiFi', 'Work Desk'],
        images: [
          'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        available: true
      }
    ]
  }
];

export const bookings: Booking[] = [
  {
    id: 'book-1',
    referenceId: 'GH-2024-001',
    propertyId: '1',
    propertyName: 'Seaside Villa Resort',
    roomIds: ['1-1'],
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+1234567890',
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    guests: 2,
    selectedAmenities: ['Pool', 'Spa'],
    totalAmount: 1050,
    status: 'confirmed',
    createdAt: '2024-01-15',
    notes: 'Please arrange for late check-in after 10 PM'
  },
  {
    id: 'book-2',
    referenceId: 'GH-2024-002',
    propertyId: '2',
    propertyName: 'Mountain Lodge Retreat',
    roomIds: ['2-1'],
    guestName: 'Jane Smith',
    guestEmail: 'jane@example.com',
    guestPhone: '+1234567891',
    checkIn: '2024-02-20',
    checkOut: '2024-02-23',
    guests: 4,
    selectedAmenities: ['Hiking Trails', 'Spa'],
    totalAmount: 900,
    status: 'payment_pending',
    createdAt: '2024-01-20',
    notes: 'Anniversary celebration - please arrange flowers in room'
  }
];

export const availableAmenities = [
  'Pool', 'Spa', 'Beach Access', 'WiFi', 'Restaurant', 'Gym', 
  'Fireplace', 'Hiking Trails', 'Rooftop Bar', 'Business Center', 
  'Concierge', 'Room Service', 'Laundry Service', 'Parking'
];