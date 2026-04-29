/*
  BookingPage.jsx – Shows all bookings for the logged-in user across every trip.
  Fetches from bookingService.getAllUserBookings() → GET /api/bookings.
  Users can filter by booking type (All / Hotel / Flight / Transport / Other).
*/
import { useState, useEffect } from 'react';
import { Calendar, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { getAllUserBookings, deleteBooking } from '../services/bookingService';

const FILTER_OPTIONS = ['All', 'Hotel', 'Flight', 'Transport', 'Other'];

const BookingPage = () => {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getAllUserBookings();
        setBookings(data.data || []);
      } catch {
        toast.error('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleDeleteBooking = async (bookingId) => {
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      toast.success('Booking removed.');
    } catch {
      toast.error('Failed to delete booking.');
    }
  };

  const filteredBookings = activeFilter === 'All'
    ? bookings
    : bookings.filter((b) => b.bookingType === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" /> My Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">All your reservations across every trip</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {option}
              <span className="ml-1.5 text-xs opacity-70">
                ({option === 'All' ? bookings.length : bookings.filter((b) => b.bookingType === option).length})
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Booking grid */}
        {!loading && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} onDelete={handleDeleteBooking} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 font-medium">No {activeFilter !== 'All' ? activeFilter : ''} bookings found</p>
            <p className="text-sm text-slate-400 mt-1">Add bookings inside any trip to see them here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingPage;
