/*
  BookingPage.jsx – All user bookings with context-specific Add/Edit forms.

  KEY CONCEPT (for viva): The booking form uses a single `bookingType` state
  variable to conditionally render different field sets:
    - 'Hotel'     → Hotel Name, Check-in/out Date+Time, Room Type, Address
    - 'Flight'    → Airline, Flight Number, Departure/Arrival Time, PNR
    - 'Transport' → Provider, Pickup/Dropoff, Departure Time, Vehicle Details

  This is controlled by: if (bookingType === 'Hotel') { ... }
  React re-renders the correct fields whenever bookingType changes.
*/
import { useState, useEffect } from 'react';
import { Calendar, Briefcase, Plus, X, Save, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getAllUserBookings, createBooking, updateBooking, deleteBooking } from '../services/bookingService';

const FILTER_OPTIONS = ['All', 'Hotel', 'Flight', 'Transport'];

// ── Type badge styling ────────────────────────────────────────────────────────
const TYPE_BADGE = {
  Hotel:     'bg-emerald-50 text-emerald-700',
  Flight:    'bg-blue-50 text-blue-700',
  Transport: 'bg-amber-50 text-amber-700',
};

// ── Context-Specific Booking Form ─────────────────────────────────────────────
// editingBooking = null means "Add mode"; pass an existing booking for "Edit mode"
const BookingForm = ({ editingBooking, onSave, onCancel }) => {
  // Initialise form fields based on whether we're editing an existing booking
  const [bookingType, setBookingType] = useState(editingBooking?.bookingType || 'Hotel');
  const [fields, setFields] = useState(
    editingBooking
      ? { ...editingBooking }
      : { bookingName: '', checkInDate: '', checkOutDate: '', confirmationNumber: '',
          roomType: '', address: '', airline: '', flightNumber: '',
          departureTime: '', arrivalTime: '', serviceProvider: '',
          pickupLocation: '', dropoffLocation: '', vehicleDetails: '' }
  );
  const [saving, setSaving] = useState(false);

  // Helper to update a single field without losing others
  const setField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const inputClass = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const Field = ({ label, id, children }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.bookingName?.trim()) { toast.error('Booking name is required.'); return; }
    setSaving(true);
    try {
      const payload = { ...fields, bookingType };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">{editingBooking ? 'Edit Booking' : 'Add New Booking'}</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
      </div>

      {/* Booking type selector – drives conditional field rendering below */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-600 mb-1">Booking Type</label>
        <div className="flex gap-2">
          {FILTER_OPTIONS.filter(o => o !== 'All').map((t) => (
            <button type="button" key={t} onClick={() => setBookingType(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${bookingType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Hotel Fields ── */}
        {bookingType === 'Hotel' && (
          <>
            <Field label="Hotel Name *" id="hotel-name">
              <input id="hotel-name" type="text" placeholder="e.g. Taj Resort" value={fields.bookingName} onChange={(e) => setField('bookingName', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Room Type" id="room-type">
              <input id="room-type" type="text" placeholder="e.g. Deluxe Sea View" value={fields.roomType || ''} onChange={(e) => setField('roomType', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Check-in Date & Time" id="checkin">
              <input id="checkin" type="datetime-local" value={fields.checkInDate} onChange={(e) => setField('checkInDate', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Check-out Date & Time" id="checkout">
              <input id="checkout" type="datetime-local" value={fields.checkOutDate} onChange={(e) => setField('checkOutDate', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Address" id="hotel-addr">
              <input id="hotel-addr" type="text" placeholder="Hotel address" value={fields.address || ''} onChange={(e) => setField('address', e.target.value)} className={`${inputClass} sm:col-span-2`} />
            </Field>
          </>
        )}

        {/* ── Flight Fields ── */}
        {bookingType === 'Flight' && (
          <>
            <Field label="Airline *" id="airline">
              <input id="airline" type="text" placeholder="e.g. IndiGo" value={fields.bookingName} onChange={(e) => setField('bookingName', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Flight Number" id="flight-no">
              <input id="flight-no" type="text" placeholder="e.g. 6E-201" value={fields.flightNumber || ''} onChange={(e) => setField('flightNumber', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Departure Date & Time" id="dep-time">
              <input id="dep-time" type="datetime-local" value={fields.departureTime || ''} onChange={(e) => setField('departureTime', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Arrival Date & Time" id="arr-time">
              <input id="arr-time" type="datetime-local" value={fields.arrivalTime || ''} onChange={(e) => setField('arrivalTime', e.target.value)} className={inputClass} />
            </Field>
            <Field label="PNR / Confirmation Number" id="pnr">
              <input id="pnr" type="text" placeholder="e.g. ABC123" value={fields.confirmationNumber} onChange={(e) => setField('confirmationNumber', e.target.value.toUpperCase())} className={`${inputClass} font-mono`} />
            </Field>
          </>
        )}

        {/* ── Transport Fields ── */}
        {bookingType === 'Transport' && (
          <>
            <Field label="Service Provider *" id="provider">
              <input id="provider" type="text" placeholder="e.g. Ola / KSRTC" value={fields.bookingName} onChange={(e) => setField('bookingName', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Vehicle Details" id="vehicle">
              <input id="vehicle" type="text" placeholder="e.g. Toyota Innova / Bus" value={fields.vehicleDetails || ''} onChange={(e) => setField('vehicleDetails', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Pickup Location" id="pickup">
              <input id="pickup" type="text" placeholder="e.g. Goa Airport" value={fields.pickupLocation || ''} onChange={(e) => setField('pickupLocation', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Drop-off Location" id="dropoff">
              <input id="dropoff" type="text" placeholder="e.g. Baga Beach Hotel" value={fields.dropoffLocation || ''} onChange={(e) => setField('dropoffLocation', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Departure Date & Time" id="transport-dep">
              <input id="transport-dep" type="datetime-local" value={fields.departureTime || ''} onChange={(e) => setField('departureTime', e.target.value)} className={inputClass} />
            </Field>
          </>
        )}
      </div>

      <div className="flex gap-3 justify-end mt-5">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : editingBooking ? 'Save Changes' : 'Add Booking'}
        </button>
      </div>
    </form>
  );
};

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingItem = ({ booking, onEdit, onDelete }) => {
  const badge = TYPE_BADGE[booking.bookingType] || 'bg-slate-100 text-slate-600';
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>{booking.bookingType}</span>
          <h4 className="font-semibold text-slate-900 text-sm mt-1">{booking.bookingName}</h4>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onEdit(booking)} className="text-blue-500 hover:text-blue-700 transition-colors" aria-label="Edit"><Edit className="w-4 h-4" /></button>
          <button onClick={() => onDelete(booking._id)} className="text-slate-400 hover:text-red-500 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      {booking.checkInDate && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(booking.checkInDate).toLocaleDateString()}{booking.checkOutDate ? ` – ${new Date(booking.checkOutDate).toLocaleDateString()}` : ''}</p>}
      {booking.confirmationNumber && <p className="text-xs text-slate-500 font-mono mt-1">#{booking.confirmationNumber}</p>}
      {booking.pickupLocation && <p className="text-xs text-slate-500 mt-1">{booking.pickupLocation} → {booking.dropoffLocation}</p>}
      {booking.flightNumber && <p className="text-xs text-slate-500 mt-1">Flight: {booking.flightNumber}</p>}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const BookingPage = () => {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showForm, setShowForm]         = useState(false);
  // editingBooking = null → Add mode; set to booking object → Edit mode
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getAllUserBookings();
        setBookings(data.data || []);
      } catch { toast.error('Failed to load bookings.'); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  const handleSave = async (payload) => {
    try {
      if (editingBooking) {
        // UPDATE: replace the old booking in local state with the returned updated one
        const updated = await updateBooking(editingBooking._id, payload);
        setBookings((prev) => prev.map((b) => (b._id === editingBooking._id ? updated.data : b)));
        toast.success('Booking updated!');
      } else {
        // CREATE: append new booking to local state
        const created = await createBooking(payload);
        setBookings((prev) => [...prev, created.data]);
        toast.success('Booking added!');
      }
      setShowForm(false);
      setEditingBooking(null);
    } catch { toast.error('Failed to save booking.'); }
  };

  const handleEdit = (booking) => { setEditingBooking(booking); setShowForm(true); };

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast.success('Booking removed.');
    } catch { toast.error('Failed to delete booking.'); }
  };

  const handleCancel = () => { setShowForm(false); setEditingBooking(null); };

  const filteredBookings = activeFilter === 'All' ? bookings : bookings.filter((b) => b.bookingType === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Briefcase className="w-6 h-6 text-blue-600" /> My Bookings</h1>
            <p className="text-sm text-slate-500 mt-0.5">All reservations across every trip</p>
          </div>
          {!showForm && (
            <button onClick={() => { setEditingBooking(null); setShowForm(true); }} className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Booking
            </button>
          )}
        </div>

        {/* Add/Edit form */}
        {showForm && <BookingForm editingBooking={editingBooking} onSave={handleSave} onCancel={handleCancel} />}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', ...FILTER_OPTIONS.filter(o => o !== 'All')].map((opt) => (
            <button key={opt} onClick={() => setActiveFilter(opt)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === opt ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {opt} <span className="ml-1 text-xs opacity-70">({opt === 'All' ? bookings.length : bookings.filter(b => b.bookingType === opt).length})</span>
            </button>
          ))}
        </div>

        {loading && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map(n => <div key={n} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />)}</div>}

        {!loading && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBookings.map((b) => <BookingItem key={b._id} booking={b} onEdit={handleEdit} onDelete={handleDelete} />)}
          </div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 font-medium">No {activeFilter !== 'All' ? activeFilter : ''} bookings found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingPage;
