# Frontend-Backend API Integration

This document describes the API integration between the frontend and backend of the Guest House Management System.

## 🚀 Quick Start

### 1. Backend Setup
Make sure your Spring Boot backend is running on `http://localhost:8080`

### 2. Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` file with your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📁 API Structure

### Core API Files
- `src/lib/api.ts` - Generic API client
- `src/lib/api/propertyApi.ts` - Property management endpoints
- `src/lib/api/bookingApi.ts` - Booking management endpoints
- `src/lib/api/bookingRoomApi.ts` - Booking room operations
- `src/lib/api/bookingStatusHistoryApi.ts` - Status history tracking
- `src/lib/api/temporaryTokenApi.ts` - Token management

### Custom Hooks
- `src/hooks/useApi.ts` - Generic API hook with loading/error states
- `src/hooks/useProperties.ts` - Property-specific hooks
- `src/hooks/useBookings.ts` - Booking-specific hooks

### Data Transformers
- `src/lib/dataTransformers.ts` - Convert between frontend/backend data formats

## 🔧 API Endpoints

### Properties
- `GET /api/property/` - Get all properties
- `GET /api/property/{id}` - Get property details
- `POST /api/property/` - Create property
- `PATCH /api/property/{id}` - Update property
- `DELETE /api/property/{id}` - Delete property

### Bookings (Admin)
- `GET /api/bookings/admin` - Get all bookings
- `GET /api/bookings/admin/{id}` - Get booking details
- `POST /api/bookings/admin/create` - Create booking
- `PUT /api/bookings/admin/{id}` - Update booking
- `POST /api/bookings/admin/{id}/confirm` - Confirm booking
- `POST /api/bookings/admin/{id}/cancel` - Cancel booking
- `POST /api/bookings/admin/{id}/attach-rooms` - Attach rooms

### Bookings (Guest)
- `POST /api/bookings/guest/create` - Create booking
- `PATCH /api/bookings/guest/{id}` - Update booking
- `POST /api/bookings/guest/{id}/amend` - Amend booking
- `POST /api/bookings/guest/{id}/cancel` - Cancel booking
- `GET /api/bookings/guest/{token}` - Get booking by token

## 🎯 Usage Examples

### Fetching Properties
```typescript
import { useProperties } from '../hooks/useProperties';

function PropertyList() {
  const { properties, loading, error, refetch } = useProperties();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {properties.map(property => (
        <div key={property.id}>{property.name}</div>
      ))}
    </div>
  );
}
```

### Creating a Booking
```typescript
import { useBookingManagement } from '../hooks/useBookings';

function BookingForm() {
  const { createBookingAsGuest, loading, error, success } = useBookingManagement();
  
  const handleSubmit = async (bookingData) => {
    try {
      await createBookingAsGuest(bookingData);
      // Success message will be shown automatically
    } catch (err) {
      // Error is handled by the hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## 🔄 Data Flow

1. **API Call** → Custom hook (e.g., `useProperties`)
2. **Data Transformation** → `dataTransformers.ts`
3. **State Update** → Context/State management
4. **UI Update** → React components

## 🛠️ Error Handling

The API client includes comprehensive error handling:

- **Network errors** - Connection issues, timeouts
- **HTTP errors** - 4xx, 5xx status codes
- **Validation errors** - Backend validation failures
- **Business logic errors** - Custom application errors

## 📊 Loading States

All API hooks provide loading states:

```typescript
const { data, loading, error } = useApi(apiCall);
```

## 🔐 Authentication

Currently, the system uses:
- **Admin authentication** - Mock authentication for admin panel
- **Guest access** - Token-based access for guest bookings

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend has CORS configured for frontend origin
   - Check `@CrossOrigin` annotation on controllers

2. **API Connection Issues**
   - Verify backend is running on correct port
   - Check API base URL in environment variables

3. **Data Format Mismatches**
   - Check data transformers for proper field mapping
   - Verify TypeScript types match backend DTOs

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug', 'api');
```

## 🔄 Migration from Mock Data

The system is designed to work with both mock data and real API:

1. **Development** - Uses mock data by default
2. **Production** - Switches to API calls automatically
3. **Testing** - Can use either mock or real API

## 📈 Performance

- **Caching** - API responses are cached in context
- **Loading states** - Prevents duplicate requests
- **Error boundaries** - Graceful error handling
- **Optimistic updates** - Immediate UI feedback

## 🧪 Testing

Run tests with:
```bash
npm test
```

API integration tests:
```bash
npm run test:api
```
