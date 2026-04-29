/*
  TripDetails.jsx – Core dashboard for a single trip.
  Fetches trip data, activities, and bookings concurrently via Promise.all.
  Broken into clearly named sub-components within this file:
    - TripHeader: hero section with trip name, dates, destination, and action buttons
    - StatsRow: shows counts for activities, bookings, and days remaining
    - ItinerarySection: activity list with an inline "Add Activity" form
    - BookingsSection: booking list with an inline "Add Booking" form
*/
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Trash2, Plus, X, Edit, Clock, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ActivityCard from '../components/ActivityCard';
import BookingCard from '../components/BookingCard';
import { useTrips } from '../context/TripContext';
import { getTripById } from '../services/tripService';
import { getActivitiesByTrip, createActivity, deleteActivity } from '../services/activityService';
import { getBookingsByTrip, createBooking, deleteBooking } from '../services/bookingService';
import { formatDateLong, calculateTripDuration, getTripStatus, getStatusBadgeClass } from '../utils/helperFunctions';

// ─── Sub-component: Page hero/header ─────────────────────────────────────────
const TripHeader = ({ trip, onDelete, onEdit }) => {
  const status     = getTripStatus(trip.startDate, trip.endDate);
  const badgeClass = getStatusBadgeClass(status);
  const duration   = calculateTripDuration(trip.startDate, trip.endDate);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 truncate" data-testid="trip-title">
              {trip.tripName}
            </h1>
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>{status}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{trip.destination}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" />{formatDateLong(trip.startDate)} – {formatDateLong(trip.endDate)}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />{duration} days</span>
          </div>
          {trip.description && <p className="mt-3 text-sm text-slate-500 leading-relaxed">{trip.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button onClick={onDelete} data-testid="delete-trip-button" className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-component: Stats row ─────────────────────────────────────────────────
const StatsRow = ({ activitiesCount, bookingsCount, daysRemaining }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    {[
      { label: 'Activities', value: activitiesCount,  color: 'text-blue-600'  },
      { label: 'Bookings',   value: bookingsCount,    color: 'text-green-600' },
      { label: 'Days Left',  value: Math.max(0, daysRemaining), color: 'text-slate-900' },
    ].map(({ label, value, color }) => (
      <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    ))}
  </div>
);

// ─── Sub-component: Add Activity inline form ──────────────────────────────────
const AddActivityForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({ activityName: '', activityDate: '', location: '', description: '' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.activityName.trim()) { toast.error('Activity name is required.'); return; }
    onSave(form);
  };

  return (
    <form onSubmit={handleSave} data-testid="activity-form" className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Activity Name *</label>
          <input data-testid="activity-name-input" type="text" placeholder="e.g. Sunset Cruise" value={form.activityName} onChange={(e) => setForm({ ...form, activityName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
          <input data-testid="activity-date-input" type="date" value={form.activityDate} onChange={(e) => setForm({ ...form, activityDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
          <input data-testid="activity-location-input" type="text" placeholder="e.g. Baga Beach" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea data-testid="activity-description-input" rows={2} placeholder="What are you planning?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" data-testid="activity-cancel-button" onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" data-testid="activity-save-button" className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Save Activity</button>
      </div>
    </form>
  );
};

// ─── Sub-component: Itinerary section ────────────────────────────────────────
const ItinerarySection = ({ activities, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);

  const handleAddActivity = async (formData) => {
    await onAdd(formData);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" /> Activities
          <span className="text-sm font-normal text-slate-400">({activities.length})</span>
        </h2>
        <button onClick={() => setShowForm(!showForm)} data-testid="add-activity-button" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add</>}
        </button>
      </div>

      {showForm && <AddActivityForm onSave={handleAddActivity} onCancel={() => setShowForm(false)} />}

      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
          No activities yet. Click "Add" to plan something.
        </p>
      ) : (
        <div className="space-y-3" data-testid="activities-list">
          {activities.map((activity) => (
            <ActivityCard key={activity._id} activity={activity} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sub-component: Add Booking inline form ───────────────────────────────────
const AddBookingForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({ bookingType: 'Hotel', bookingName: '', checkInDate: '', checkOutDate: '', confirmationNumber: '' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.bookingName.trim()) { toast.error('Booking name is required.'); return; }
    onSave(form);
  };

  return (
    <form onSubmit={handleSave} data-testid="booking-form" className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
          <select data-testid="booking-type-select" value={form.bookingType} onChange={(e) => setForm({ ...form, bookingType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {['Hotel', 'Flight', 'Transport', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
          <input data-testid="booking-name-input" type="text" placeholder="e.g. Taj Resort" value={form.bookingName} onChange={(e) => setForm({ ...form, bookingName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Check-in</label>
          <input data-testid="booking-checkin-input" type="date" value={form.checkInDate} onChange={(e) => setForm({ ...form, checkInDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Check-out</label>
          <input data-testid="booking-checkout-input" type="date" value={form.checkOutDate} onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Confirmation #</label>
          <input data-testid="booking-confirmation-input" type="text" placeholder="e.g. HOTEL123" value={form.confirmationNumber} onChange={(e) => setForm({ ...form, confirmationNumber: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" data-testid="booking-cancel-button" onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" data-testid="booking-save-button" className="px-3 py-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">Save Booking</button>
      </div>
    </form>
  );
};

// ─── Sub-component: Bookings section ─────────────────────────────────────────
const BookingsSection = ({ bookings, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);

  const handleAddBooking = async (formData) => {
    await onAdd(formData);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" /> Bookings
          <span className="text-sm font-normal text-slate-400">({bookings.length})</span>
        </h2>
        <button onClick={() => setShowForm(!showForm)} data-testid="add-booking-button" className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add</>}
        </button>
      </div>

      {showForm && <AddBookingForm onSave={handleAddBooking} onCancel={() => setShowForm(false)} />}

      {bookings.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
          No bookings yet. Click "Add" to track a booking.
        </p>
      ) : (
        <div className="space-y-3" data-testid="bookings-list">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main page component ──────────────────────────────────────────────────────
const TripDetails = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { removeTrip } = useTrips();

  const [trip, setTrip]         = useState(null);
  const [activities, setActivities] = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);

  // Fetch trip data, activities, and bookings in parallel on mount
  useEffect(() => {
    const fetchAllTripData = async () => {
      try {
        const [tripRes, actRes, bookRes] = await Promise.all([
          getTripById(id),
          getActivitiesByTrip(id),
          getBookingsByTrip(id),
        ]);
        setTrip(tripRes.data);
        setActivities(actRes.data);
        setBookings(bookRes.data);
      } catch {
        toast.error('Failed to load trip details.');
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };
    fetchAllTripData();
  }, [id, navigate]);

  const handleAddActivity = async (formData) => {
    try {
      const result = await createActivity({ tripId: id, ...formData });
      setActivities((prev) => [...prev, result.data]);
      toast.success('Activity added!');
    } catch {
      toast.error('Failed to add activity.');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteActivity(activityId);
      setActivities((prev) => prev.filter((a) => a._id !== activityId));
      toast.success('Activity removed.');
    } catch {
      toast.error('Failed to delete activity.');
    }
  };

  const handleAddBooking = async (formData) => {
    try {
      const result = await createBooking({ tripId: id, ...formData });
      setBookings((prev) => [...prev, result.data]);
      toast.success('Booking added!');
    } catch {
      toast.error('Failed to add booking.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      toast.success('Booking removed.');
    } catch {
      toast.error('Failed to delete booking.');
    }
  };

  const handleDeleteTrip = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${trip?.tripName}"?`);
    if (!confirmed) return;
    try {
      await removeTrip(id);
      toast.success('Trip deleted.');
      navigate('/trips');
    } catch {
      toast.error('Failed to delete trip.');
    }
  };

  // Calculate days remaining from today to the trip's end date
  const daysRemaining = trip
    ? Math.ceil((new Date(trip.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
            <div className="h-7 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="trip-details-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4">
          <button onClick={() => navigate('/trips')} className="hover:text-blue-600 transition-colors">My Trips</button>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">{trip.tripName}</span>
        </nav>

        <TripHeader trip={trip} onDelete={handleDeleteTrip} onEdit={() => navigate(`/trips/${id}/edit`)} />
        <StatsRow activitiesCount={activities.length} bookingsCount={bookings.length} daysRemaining={daysRemaining} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <ItinerarySection activities={activities} onAdd={handleAddActivity} onDelete={handleDeleteActivity} />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <BookingsSection bookings={bookings} onAdd={handleAddBooking} onDelete={handleDeleteBooking} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripDetails;
