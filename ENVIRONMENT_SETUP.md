# Environment Setup

## Required Environment Variables

Create a `.env` file in the Frontend directory with the following content:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Backend Requirements

Make sure your Spring Boot backend is running on `http://localhost:8080` with the following endpoints available:

- Properties: `/api/property/`
- Bookings: `/api/bookings/`
- Booking Rooms: `/api/booking-rooms/`
- Status History: `/api/admin/bookings/`
- Temporary Tokens: `/api/admin/temporary-token/`

## CORS Configuration

Ensure your backend has CORS configured to allow requests from `http://localhost:5173` (Vite dev server).

Example Spring Boot CORS configuration:
```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class PropertyController {
    // Your controller code
}
```

## Testing the Connection

1. Start your Spring Boot backend
2. Start the frontend: `npm run dev`
3. Open `http://localhost:5173`
4. The application should now connect to your backend API

## Troubleshooting

If you see API connection errors:
1. Verify backend is running on port 8080
2. Check CORS configuration
3. Verify API endpoints are accessible
4. Check browser console for detailed error messages
