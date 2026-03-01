# Quick Start Guide - 帰り便シェア Platform

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` in project root:
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## First Time Login

### Create Test Accounts

#### Driver Account
1. Go to `/register`
2. Fill form:
   - Name: テストドライバー
   - Email: driver@test.com
   - Role: ドライバー
   - Company: テスト配送 (optional)
   - Phone: 090-1234-5678 (optional)
   - Password: test123456

3. Login with same credentials

#### Shipper Account
1. Go to `/register`
2. Fill form:
   - Name: テスト荷主
   - Email: shipper@test.com
   - Role: 荷主
   - Password: test123456

3. Login

## Key Pages & Features

### For Drivers
```
/dashboard          → View trip stats and requests
/trips/new          → Register new delivery trip
/my-trips           → Manage registered trips
/trips/:id          → View trip details & matching requests
```

**Steps to Register a Trip:**
1. Navigate to "便を登録" in navbar
2. Enter origin address (e.g., 東京都渋谷区)
3. Enter destination address (e.g., 大阪府大阪市)
4. Select vehicle type (軽トラ, 2t, 4t, 10t, 大型)
5. Set available weight (kg)
6. Set departure date/time
7. Set price (¥)
8. Click "便を登録"

### For Shippers
```
/dashboard          → View matching stats
/trips/search       → Find available trips
/my-matches         → Track matching requests
```

**Steps to Search & Request Match:**
1. Navigate to "便を探す" in navbar
2. Enter origin and destination
3. Set search radius (10-全国)
4. Click "便を検索"
5. Click on trip card
6. Enter cargo weight
7. Add description (optional)
8. Click "リクエストを送信"

### For Admins
```
/admin              → Platform statistics
/admin/users        → All registered users
/admin/trips        → All trips with status
```

## API Backend Requirements

Ensure backend is running with these endpoints:

### Essential for Testing
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- GET/POST `/api/v1/trips`
- GET/POST `/api/v1/matches`
- GET `/api/v1/admin/stats`

## Common Issues & Solutions

### "Cannot find module 'react-router-dom'"
```bash
npm install
```

### "API connection failed"
Check backend is running on `http://localhost:8080`
Update `VITE_API_URL` in `.env.local`

### "Google Maps API errors"
Add valid `VITE_GOOGLE_MAPS_API_KEY` to `.env.local`

### Auth token expired
Clear localStorage and login again:
```javascript
localStorage.clear()
location.reload()
```

## Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

Output: `dist/` directory

## Component Examples

### Simple Login Flow
```jsx
import LoginPage from './pages/LoginPage'
// User enters email/password
// On success, redirected to /dashboard
```

### Protected Route Example
```jsx
<Route
  path="/trips/new"
  element={
    <ProtectedRoute requiredRole="driver">
      <TripCreatePage />
    </ProtectedRoute>
  }
/>
```

## Useful Development Commands

```bash
# Format code
npm run lint

# Hot reload (automatic on save)
npm run dev

# Build production
npm run build

# Clear node modules
rm -rf node_modules
npm install
```

## Testing Checklist

- [ ] Register as driver
- [ ] Register as shipper
- [ ] Login with both accounts
- [ ] Driver: Create a trip
- [ ] Shipper: Search trips
- [ ] Shipper: Send matching request
- [ ] Driver: View matching request
- [ ] Driver: Approve/reject match
- [ ] Check dashboard stats
- [ ] Test responsive design (mobile view)

## File Structure Quick Reference

```
src/
├── pages/           # All page components
├── components/      # Reusable UI components
├── hooks/          # Custom React hooks (useAuth, useTrips)
├── context/        # Auth context
├── api/            # API calls
└── App.jsx         # Router setup
```

## Key Hooks to Use

```jsx
import { useAuth } from './hooks/useAuth'
import { useTrips } from './hooks/useTrips'
import { useMatches } from './hooks/useMatches'

// In your component:
const { user, logout } = useAuth()
const { trips, createTrip } = useTrips()
const { matches, approveMatch } = useMatches()
```

## Navigation Tips

### Navbar Links (Dynamic by Role)
- **Common**: ダッシュボード
- **Driver Only**: 便を登録, マイ便
- **Shipper Only**: 便を探す, マイリクエスト
- **Admin Only**: 管理パネル
- **All**: User profile dropdown with ログアウト

## Role-Based Access

| Feature | Driver | Shipper | Admin |
|---------|--------|---------|-------|
| Register Trip | ✓ | | |
| Search Trips | | ✓ | |
| Create Match | | ✓ | |
| Approve Match | ✓ | | |
| View Stats | ✓ | ✓ | ✓ |
| Admin Panel | | | ✓ |

## Performance Tips

1. Disable browser extensions during dev
2. Clear cache if styles look wrong
3. Use Chrome DevTools Network tab to debug API
4. Check console for detailed error messages

## Next Steps

1. Explore component structure in `src/components/`
2. Review page implementations in `src/pages/`
3. Check API integration in `src/api/`
4. Read full `PLATFORM_GUIDE.md` for detailed docs
5. Review `IMPLEMENTATION_SUMMARY.md` for features

## Support Resources

- React Docs: https://react.dev
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev
- Axios: https://axios-http.com

---

**Platform**: 帰り便シェア (Return Trip Sharing)
**Version**: 0.1.0
**Status**: Development Ready
