/*
  Dashboard.jsx – Main screen for logged-in users showing all their trips.
  Fetches trips from TripContext on mount. Displays a summary stats row,
  a search/filter bar, and a grid of TripCard components.
  Route: /trips (ProtectedRoute)
*/
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Plane, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import TripCard from '../components/TripCard';
import { useTrips } from '../context/TripContext';
import { getTripStatus } from '../utils/helperFunctions';
import { getTips } from '../services/adminService';

const CATEGORY_COLORS = {
  General:      'bg-slate-100 text-slate-700',
  Packing:      'bg-blue-50 text-blue-700',
  Safety:       'bg-red-50 text-red-700',
  Health:       'bg-green-50 text-green-700',
  Budget:       'bg-amber-50 text-amber-700',
  Photography:  'bg-purple-50 text-purple-700',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { trips, loading, error, fetchTrips } = useTrips();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tips, setTips] = useState([]);
  const [tipsExpanded, setTipsExpanded] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    getTips()
      .then((data) => {
        const allTips = data.data || [];
        // Shuffle and pick 3 random tips to keep the dashboard fresh
        const randomTips = [...allTips].sort(() => 0.5 - Math.random()).slice(0, 3);
        setTips(randomTips);
      })
      .catch(() => setTips([])); // silently fail if no tips yet
  }, []);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.tripName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || getTripStatus(trip.startDate, trip.endDate) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingCount  = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'Upcoming').length;
  const ongoingCount   = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'Ongoing').length;
  const completedCount = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'Completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage and view all your travel plans</p>
          </div>
          <button
            onClick={() => navigate('/trips/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-sm hover:scale-105 hover:shadow-md active:scale-95"
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
          ].map(({ label, value, color }, i) => (
            <div
              key={label}
              className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center card-hover animate-slide-left delay-${i * 100}`}
            >
              <p className={`text-3xl font-bold ${color} transition-all duration-300`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up delay-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by trip name or destination…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.01] transition-all bg-white"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Upcoming', 'Ongoing', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm scale-105'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton h-8 w-full mt-1" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm animate-fade-in-down">
            {error}
          </div>
        )}

        {/* Trip grid */}
        {!loading && !error && filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map((trip, i) => (
              <div key={trip._id} className={`animate-fade-in-up delay-${Math.min(i * 100, 400)}`}>
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredTrips.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm animate-fade-in-up">
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
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm hover:scale-105 hover:shadow-md"
              >
                <Plus className="w-4 h-4" /> Create a Trip
              </button>
            )}
          </div>
        )}

        {/* ── Travel Tips section ── */}
        {tips.length > 0 && (
          <div className="mt-10 animate-fade-in-up">
            {/* Section header */}
            <button
              onClick={() => setTipsExpanded((v) => !v)}
              className="flex items-center justify-between w-full mb-4 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 text-left">Travel Tips</h2>
                  <p className="text-xs text-slate-400 text-left">Helpful advice for your next trip</p>
                </div>
              </div>
              {tipsExpanded
                ? <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                : <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />}
            </button>

            {tipsExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tips.map((tip) => (
                  <div
                    key={tip._id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          CATEGORY_COLORS[tip.category] || CATEGORY_COLORS.General
                        }`}
                      >
                        {tip.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">{tip.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{tip.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
