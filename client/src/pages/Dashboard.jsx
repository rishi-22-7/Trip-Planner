/*
  Dashboard.jsx – Main screen for logged-in users showing all their trips.
  Fetches trips from TripContext on mount. Displays a summary stats row,
  a search/filter bar, and a grid of TripCard components.
  Route: /trips (ProtectedRoute)
*/
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Plane } from 'lucide-react';
import Navbar from '../components/Navbar';
import TripCard from '../components/TripCard';
import { useTrips } from '../context/TripContext';
import { getTripStatus } from '../utils/helperFunctions';

const Dashboard = () => {
  const navigate = useNavigate();
  const { trips, loading, error, fetchTrips } = useTrips();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch trips when the Dashboard mounts for the first time
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Apply search + filter without mutating the original trips array
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.tripName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || getTripStatus(trip.startDate, trip.endDate) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count trips by status for the stat cards
  const upcomingCount  = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'Upcoming').length;
  const ongoingCount   = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'Ongoing').length;
  const completedCount = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'Completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage and view all your travel plans</p>
          </div>
          <button
            onClick={() => navigate('/trips/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
            data-testid="create-trip-btn"
          >
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',     value: trips.length,    color: 'text-slate-900' },
            { label: 'Upcoming',  value: upcomingCount,   color: 'text-blue-600'  },
            { label: 'Ongoing',   value: ongoingCount,    color: 'text-green-600' },
            { label: 'Completed', value: completedCount,  color: 'text-slate-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by trip name or destination…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Upcoming', 'Ongoing', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
                <div className="h-8 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Trip grid */}
        {!loading && !error && filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredTrips.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="font-semibold text-slate-700 mb-1">
              {trips.length === 0 ? 'No trips yet' : 'No trips match your filters'}
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              {trips.length === 0
                ? 'Create your first trip to get started.'
                : 'Try adjusting your search or filter.'}
            </p>
            {trips.length === 0 && (
              <button
                onClick={() => navigate('/trips/new')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Create a Trip
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
