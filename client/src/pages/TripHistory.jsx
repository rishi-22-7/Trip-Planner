/*
  TripHistory.jsx – Displays completed trips in a simple table/list layout.
  Reads from TripContext (already fetched by Dashboard).
  Filters for trips where endDate < today using getTripStatus() helper.
*/
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, MapPin, Calendar, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTrips } from '../context/TripContext';
import { getTripStatus, formatDateLong, calculateTripDuration } from '../utils/helperFunctions';

const TripHistory = () => {
  const navigate = useNavigate();
  const { trips, loading, fetchTrips } = useTrips();

  useEffect(() => {
    if (trips.length === 0) fetchTrips();
  }, [trips.length, fetchTrips]);

  const completedTrips = trips
    .filter((t) => getTripStatus(t.startDate, t.endDate) === 'Completed')
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate)); // newest first

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" /> Trip History
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Your completed adventures</p>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && completedTrips.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 font-medium">No completed trips yet</p>
            <p className="text-sm text-slate-400 mt-1">Finished trips will appear here after their end date passes.</p>
          </div>
        )}

        {!loading && completedTrips.length > 0 && (
          <div className="space-y-3">
            {completedTrips.map((trip) => (
              <div
                key={trip._id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{trip.tripName}</h3>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{trip.destination}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDateLong(trip.startDate)} – {formatDateLong(trip.endDate)}</span>
                    <span className="text-slate-400">{calculateTripDuration(trip.startDate, trip.endDate)} days</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TripHistory;
