/*
  Navbar.jsx – Sticky top navigation bar.
  Renders different links based on auth state:
    - Guest:  Home, Destinations, Login, Register
    - User:   My Trips, Plan a Trip, History, Destinations, Profile, Logout
    - Admin:  Destinations, Admin (user-centric links like My Trips are hidden)
  Role check: user?.role === 'admin' gates admin-only and user-only sections.
  Reads from AuthContext so no props are needed.
*/
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Menu, X, LogOut, User, LayoutDashboard, Plus, Shield, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      isActive(path) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to={isAuthenticated ? '/trips' : '/'} className="flex items-center gap-2" data-testid="nav-brand">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-900 text-lg">Trip Planner</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {!isAuthenticated && (
              <>
                <Link to="/"            className={linkClass('/')}>Home</Link>
                <Link to="/destinations" className={linkClass('/destinations')}>Destinations</Link>
              </>
            )}

            {isAuthenticated && (
              <>
                {/* User-only links – hidden for admins who manage content, not trips */}
                {user?.role !== 'admin' && (
                  <>
                    <Link to="/trips"         className={linkClass('/trips')}>My Trips</Link>
                    <Link to="/trips/new"     className={linkClass('/trips/new')}>Plan a Trip</Link>
                    <Link to="/trips/history" className={linkClass('/trips/history')}>History</Link>
                    <Link to="/destinations" className={linkClass('/destinations')}>Destinations</Link>
                  </>
                )}
                {/* Admin-only link – only visible when role === 'admin' */}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>Admin Dashboard</Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login"    className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
                <Link to="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Register</Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" data-testid="nav-profile">
                  <User className="w-4 h-4" />
                  {user?.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors" data-testid="nav-logout">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors" data-testid="mobile-menu-toggle">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1" data-testid="mobile-menu">
            {!isAuthenticated ? (
              <>
                <MobileLink to="/"            label="Home"         onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/destinations" label="Destinations" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/login"        label="Login"        onClick={() => setMobileMenuOpen(false)} />
                <MobileLink to="/register"     label="Register"     onClick={() => setMobileMenuOpen(false)} />
              </>
            ) : (
              <>
                {/* User-only mobile links – hidden for admins */}
                {user?.role !== 'admin' && (
                  <>
                    <MobileLink to="/trips"         label="My Trips"    onClick={() => setMobileMenuOpen(false)} />
                    <MobileLink to="/trips/new"     label="Plan a Trip" onClick={() => setMobileMenuOpen(false)} />
                    <MobileLink to="/trips/history" label="History"     onClick={() => setMobileMenuOpen(false)} />
                    <MobileLink to="/destinations" label="Destinations" onClick={() => setMobileMenuOpen(false)} />
                  </>
                )}
                <MobileLink to="/profile"      label="Profile"      onClick={() => setMobileMenuOpen(false)} />
                {/* Admin-only mobile link */}
                {user?.role === 'admin' && (
                  <MobileLink to="/admin/dashboard" label="Admin Dashboard" onClick={() => setMobileMenuOpen(false)} />
                )}
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

// Small helper to reduce repetition in the mobile menu
const MobileLink = ({ to, label, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
    {label}
  </Link>
);

export default Navbar;
