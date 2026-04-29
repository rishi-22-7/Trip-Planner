/*
  routes.jsx – Central route configuration for the app.
  Defines all routes and wraps them with appropriate guards:
    - PublicOnlyRoute: redirects logged-in users away from /login, /register, /
    - ProtectedRoute:  redirects guests to /login
    - AdminRoute:      redirects non-admin users to /trips
  App.jsx imports <AppRoutes /> and renders it inside the Context providers.
*/
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import CreateTrip      from './pages/CreateTrip';
import TripDetails     from './pages/TripDetails';
import DestinationPage from './pages/DestinationPage';
import BookingPage     from './pages/BookingPage';
import TripHistory     from './pages/TripHistory';
import UserProfile     from './pages/UserProfile';
import AdminDashboard  from './pages/AdminDashboard';

// ── Route Guards ──────────────────────────────────────────────────────────────

// Redirect guests to /login; show loading spinner while session is restored
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Redirect logged-in users away from public-only pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  if (!isAuthenticated) return children;
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/trips'} replace />;
};

// Additional gate for admin-only pages
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  if (!isAuthenticated)          return <Navigate to="/login"  replace />;
  if (user?.role !== 'admin')    return <Navigate to="/trips"  replace />;
  return children;
};

// ── Route Definitions ─────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/destinations" element={<DestinationPage />} />

    {/* Public-only (redirect if logged in) */}
    <Route path="/"         element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
    <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

    {/* Protected routes (login required) */}
    <Route path="/trips"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/trips/new"     element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
    <Route path="/trips/history" element={<ProtectedRoute><TripHistory /></ProtectedRoute>} />
    <Route path="/trips/:id"     element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
    <Route path="/bookings"      element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
    <Route path="/profile"       element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

    {/* Admin routes */}
    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

    {/* Catch-all: redirect unknown URLs to home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
