import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Layout
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Main Pages
import DashboardPage from './pages/DashboardPage'
import TripSearchPage from './pages/TripSearchPage'
import TripCreatePage from './pages/TripCreatePage'
import TripDetailPage from './pages/TripDetailPage'
import MyTripsPage from './pages/MyTripsPage'
import MyMatchesPage from './pages/MyMatchesPage'
import TrackingPage from './pages/TrackingPage'
import PaymentPage from './pages/PaymentPage'

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminTripsPage from './pages/AdminTripsPage'

// Legacy - Old App Component
import OldApp from './OldApp'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes - No Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - With Layout */}
          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Trip Routes */}
            <Route
              path="/trips/search"
              element={
                <ProtectedRoute requiredRole="shipper">
                  <TripSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/new"
              element={
                <ProtectedRoute requiredRole="transport_company">
                  <TripCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <TripDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-trips"
              element={
                <ProtectedRoute requiredRole="transport_company">
                  <MyTripsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-matches"
              element={
                <ProtectedRoute>
                  <MyMatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking/:tripId"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:matchId"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trips"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTripsPage />
                </ProtectedRoute>
              }
            />

            {/* Legacy Delivery App */}
            <Route path="/legacy/delivery" element={<OldApp />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
