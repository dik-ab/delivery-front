# 帰り便シェア (Return Trip Sharing) Platform

A comprehensive Vite + React logistics matching platform connecting drivers and shippers for return trip cargo sharing.

## Project Overview

This platform enables drivers (ドライバー) to register their return trips and shippers (荷主) to find and request matching services. It includes real-time trip management, matching requests, and administrative oversight.

## Technology Stack

- **Frontend**: React 18.3.1 + Vite 5.1.6
- **Routing**: React Router v6
- **State Management**: React Context API + Custom Hooks
- **HTTP Client**: Axios with interceptors
- **Styling**: Pure CSS with responsive design
- **Maps**: Google Maps API integration
- **Language**: All Japanese UI text

## Directory Structure

```
src/
├── api/                           # API integration layer
│   ├── client.js                  # Axios client with auth interceptor
│   ├── trips.js                   # Trip CRUD endpoints
│   ├── matches.js                 # Match request operations
│   ├── tracking.js                # Location tracking API
│   └── admin.js                   # Admin statistics & management
│
├── components/                    # Reusable React components
│   ├── Layout.jsx                 # Main app layout wrapper
│   ├── Navbar.jsx                 # Navigation with role-based menu
│   ├── ProtectedRoute.jsx         # Auth guard HOC
│   ├── TripCard.jsx               # Trip listing component
│   ├── MatchCard.jsx              # Match request component
│   ├── StatsCard.jsx              # Dashboard statistics card
│   ├── [Legacy components]        # Existing delivery management components
│   └── [CSS files]                # Component-specific styles
│
├── context/                       # React Context providers
│   └── AuthContext.jsx            # User auth state & operations
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.js                 # Auth context hook
│   ├── useTrips.js                # Trip CRUD operations
│   ├── useMatches.js              # Match management
│   └── useDeliveries.js           # Legacy delivery hook
│
├── pages/                         # Page components (one per route)
│   ├── LoginPage.jsx              # User login
│   ├── RegisterPage.jsx           # User registration
│   ├── DashboardPage.jsx          # Main dashboard (role-specific)
│   ├── TripCreatePage.jsx         # Register new trip (drivers)
│   ├── TripSearchPage.jsx         # Search trips (shippers)
│   ├── TripDetailPage.jsx         # Trip details & matching
│   ├── MyTripsPage.jsx            # Driver's registered trips
│   ├── MyMatchesPage.jsx          # Matching requests view
│   ├── TrackingPage.jsx           # Live trip tracking
│   ├── AdminDashboardPage.jsx     # Admin overview & stats
│   ├── AdminUsersPage.jsx         # User management
│   ├── AdminTripsPage.jsx         # Trip management
│   └── [CSS files]                # Page-specific styles
│
├── App.jsx                        # Main router configuration
├── OldApp.jsx                     # Legacy delivery app (preserved)
├── index.jsx                      # React DOM entry point
└── index.css                      # Global styles

```

## Key Features

### Authentication (AuthContext)
- User registration with role selection (driver/shipper/admin)
- Email/password login with JWT token
- Automatic token refresh on API calls
- localStorage persistence
- Role-based access control

### Trip Management
- **Create**: Drivers register new trips with origin/destination, vehicle type, capacity, price
- **Search**: Shippers search by location/date with radius filter
- **Detail**: Full trip information with driver profile
- **Status**: open → matched → in_transit → completed

### Matching System
- Shippers send matching requests with cargo details
- Drivers approve/reject requests
- Complete matches after delivery
- Real-time status tracking
- Driver communication via messages

### Dashboard (Role-Based)
- **Driver Dashboard**: Stats on registered trips, active trips, pending matches
- **Shipper Dashboard**: Quick access to trip search, recent matching requests
- **Admin Dashboard**: Platform-wide statistics and management

### Admin Panel
- User management with role assignment
- Trip monitoring and management
- Matching statistics and overview
- Platform metrics

## Routing Structure

```
/                          → Redirect to /dashboard
/login                     → LoginPage
/register                  → RegisterPage

/dashboard                 → DashboardPage (protected)
/trips/new                 → TripCreatePage (protected, driver only)
/trips/search              → TripSearchPage (protected, shipper only)
/trips/:id                 → TripDetailPage (protected)
/my-trips                  → MyTripsPage (protected, driver only)
/my-matches                → MyMatchesPage (protected)
/tracking/:tripId          → TrackingPage (protected)

/admin                     → AdminDashboardPage (protected, admin only)
/admin/users               → AdminUsersPage (protected, admin only)
/admin/trips               → AdminTripsPage (protected, admin only)

/legacy/delivery           → OldApp (legacy delivery management)
```

## API Integration

The platform integrates with backend REST API endpoints:

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Trips
```
GET    /api/v1/trips
POST   /api/v1/trips
GET    /api/v1/trips/:id
PUT    /api/v1/trips/:id
DELETE /api/v1/trips/:id
GET    /api/v1/trips/search?origin_lat=&origin_lng=&dest_lat=&dest_lng=&radius=&date=
```

### Matches
```
GET    /api/v1/matches
POST   /api/v1/matches
PUT    /api/v1/matches/:id/approve
PUT    /api/v1/matches/:id/reject
PUT    /api/v1/matches/:id/complete
```

### Tracking
```
POST   /api/v1/tracking
GET    /api/v1/tracking/:trip_id
GET    /api/v1/tracking/:trip_id/latest
```

### Admin
```
GET /api/v1/admin/stats
GET /api/v1/admin/users
GET /api/v1/admin/trips
GET /api/v1/admin/matches
```

## Setup & Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running on http://localhost:8080

### Installation

```bash
# Install dependencies
npm install

# Set environment variables
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
The app runs on `http://localhost:5173` by default.

## User Roles & Access

### Driver (ドライバー)
- Register new trips
- View own trips
- Receive/manage matching requests
- Track trip status
- Access: `/dashboard`, `/trips/new`, `/my-trips`, `/trips/:id`

### Shipper (荷主)
- Search available trips
- Send matching requests
- View request status
- Track shipments
- Access: `/dashboard`, `/trips/search`, `/my-matches`, `/trips/:id`

### Admin (管理者)
- View platform statistics
- Manage users
- Monitor all trips
- Review matches
- Access: `/admin`, `/admin/users`, `/admin/trips`

## Component Highlights

### Layout System
- **Layout.jsx**: Main wrapper with Navbar and content outlet
- **Navbar.jsx**: Role-based navigation with mobile menu
- **ProtectedRoute.jsx**: Authentication guard with role validation

### Card Components
- **TripCard.jsx**: Displays trip info with status badge
- **MatchCard.jsx**: Shows match requests with action buttons
- **StatsCard.jsx**: Dashboard statistics display

### Page Patterns
- Form validation with error handling
- Loading states and error messages
- Responsive grid layouts
- Role-based conditional rendering

## Styling Approach

- **Color Scheme**: Dark sidebar (#1a1a2e), light content, gradient accents (#667eea to #764ba2)
- **Status Colors**:
  - Open: Blue (#3b82f6)
  - Matched: Yellow (#eab308)
  - In Transit: Green (#10b981)
  - Completed: Gray (#6b7280)
  - Cancelled: Red (#ef4444)

- **Typography**: System fonts with 14px base for accessibility
- **Spacing**: 8px base unit, 12-20px for sections
- **Breakpoints**: Mobile (≤480px), Tablet (≤768px), Desktop (>768px)

## State Management

### Global State (Context)
- **AuthContext**: User auth state, token, login/logout functions

### Local State (Hooks)
- **useTrips**: Trip CRUD and search operations
- **useMatches**: Match request management
- **useAuth**: Auth context access

## Error Handling

- API interceptor handles 401 redirects to login
- Form validation with user-friendly error messages
- Network error display with retry options
- Loading states for async operations

## Security Features

- JWT token-based authentication
- Authorization header injection via interceptor
- Protected routes with role validation
- localStorage token persistence with cleanup
- Automatic logout on 401 response

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Component-level code splitting via React Router
- Lazy loading with protected routes
- CSS-in-JS for optimized styles
- Minimal re-renders with custom hooks
- Responsive images with CSS

## Future Enhancements

- Real-time notifications (WebSocket)
- Map visualization with route display
- Driver rating/review system
- Payment integration
- SMS/Email notifications
- Advanced search filters
- Batch matching algorithms

## Legacy Support

The original delivery management app is preserved at `/legacy/delivery` path using `OldApp.jsx` component, maintaining backward compatibility.

## Environment Variables

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Build Output

Production build optimizes:
- Code splitting
- Tree shaking
- Minification
- CSS optimization
- Asset compression

Output: `dist/` directory

---

**Platform**: 帰り便シェア (Return Trip Sharing)
**Version**: 0.1.0
**Last Updated**: 2026-03-01
