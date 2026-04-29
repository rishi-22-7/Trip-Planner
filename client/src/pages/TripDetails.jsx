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
import { MapPin, Calendar, Trash2, Plus, X, Edit, Clock, Layers, Save, IndianRupee, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ActivityCard from '../components/ActivityCard';
import BookingCard from '../components/BookingCard';
import { useTrips } from '../context/TripContext';
import { getTripById, updateTrip } from '../services/tripService';
import { getActivitiesByTrip, createActivity, updateActivity, deleteActivity } from '../services/activityService';
import { getBookingsByTrip, createBooking, updateBooking, deleteBooking } from '../services/bookingService';
import { formatDateLong, calculateTripDuration, getTripStatus, getStatusBadgeClass } from '../utils/helperFunctions';

// ─── Edit Trip Modal ──────────────────────────────────────────────────────────
// editingTrip contains the current trip data; onSave receives the updated payload
const EditTripModal = ({ trip, onSave, onClose }) => {
  const [form, setForm] = useState({ tripName: trip.tripName, destination: trip.destination, startDate: trip.startDate?.split('T')[0] || '', endDate: trip.endDate?.split('T')[0] || '', estimatedBudget: trip.estimatedBudget ?? 0, description: trip.description || '' });
  const [saving, setSaving] = useState(false);
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.tripName.trim()) { toast.error('Trip name required.'); return; } setSaving(true); try { await onSave({ ...form, estimatedBudget: Number(form.estimatedBudget) || 0 }); } finally { setSaving(false); } };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-slate-900">Edit Trip</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Trip Name *</label><input type="text" value={form.tripName} onChange={e => setField('tripName', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Destination</label><input type="text" value={form.destination} onChange={e => setField('destination', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">End Date</label><input type="date" value={form.endDate} min={form.startDate} onChange={e => setField('endDate', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Estimated Budget (₹)</label><input type="number" min="0" placeholder="e.g. 50000" value={form.estimatedBudget} onChange={e => setField('estimatedBudget', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setField('description', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Activity Modal ──────────────────────────────────────────────────────
const EditActivityModal = ({ activity, onSave, onClose }) => {
  const [form, setForm] = useState({ activityName: activity.activityName, activityDate: activity.activityDate?.split('T')[0] || '', location: activity.location || '', description: activity.description || '', cost: activity.cost ?? 0 });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.activityName.trim()) { toast.error('Activity name required.'); return; } setSaving(true); try { await onSave({ ...form, cost: Number(form.cost) || 0 }); } finally { setSaving(false); } };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-slate-900">Edit Activity</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Activity Name *</label><input type="text" value={form.activityName} onChange={e => setForm(p => ({...p, activityName: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Date</label><input type="date" value={form.activityDate} onChange={e => setForm(p => ({...p, activityDate: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Location</label><input type="text" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Actual Cost (₹)</label><input type="number" min="0" placeholder="0" value={form.cost} onChange={e => setForm(p => ({...p, cost: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Booking Modal ───────────────────────────────────────────────────────
const EditBookingModal = ({ booking, onSave, onClose }) => {
  const [form, setForm] = useState({ bookingName: booking.bookingName, bookingType: booking.bookingType, checkInDate: booking.checkInDate?.split('T')[0] || '', checkOutDate: booking.checkOutDate?.split('T')[0] || '', confirmationNumber: booking.confirmationNumber || '', cost: booking.cost ?? 0 });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.bookingName.trim()) { toast.error('Booking name required.'); return; } setSaving(true); try { await onSave({ ...form, cost: Number(form.cost) || 0 }); } finally { setSaving(false); } };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-slate-900">Edit Booking</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Type</label><select value={form.bookingType} onChange={e => setForm(p => ({...p, bookingType: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">{['Hotel','Flight','Transport','Other'].map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Name *</label><input type="text" value={form.bookingName} onChange={e => setForm(p => ({...p, bookingName: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Check-in</label><input type="date" value={form.checkInDate} onChange={e => setForm(p => ({...p, checkInDate: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Check-out</label><input type="date" value={form.checkOutDate} onChange={e => setForm(p => ({...p, checkOutDate: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Confirmation #</label><input type="text" value={form.confirmationNumber} onChange={e => setForm(p => ({...p, confirmationNumber: e.target.value.toUpperCase()}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Actual Cost (₹)</label><input type="number" min="0" placeholder="0" value={form.cost} onChange={e => setForm(p => ({...p, cost: e.target.value}))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [form, setForm] = useState({ activityName: '', activityDate: '', location: '', description: '', cost: '' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.activityName.trim()) { toast.error('Activity name is required.'); return; }
    onSave({ ...form, cost: Number(form.cost) || 0 });
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
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Actual Cost (₹) — fill after completion</label>
          <input data-testid="activity-cost-input" type="number" min="0" placeholder="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
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
// onEdit is passed from TripDetails and opens the EditActivityModal
const ItinerarySection = ({ activities, onAdd, onDelete, onEdit }) => {
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
            <div key={activity._id} className="flex items-start gap-2">
              <div className="flex-1"><ActivityCard activity={activity} onDelete={onDelete} /></div>
              <button onClick={() => onEdit(activity)} className="mt-1 text-blue-400 hover:text-blue-600 transition-colors shrink-0" aria-label="Edit activity"><Edit className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sub-component: Add Booking inline form ───────────────────────────────────
const AddBookingForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({ bookingType: 'Hotel', bookingName: '', checkInDate: '', checkOutDate: '', confirmationNumber: '', cost: '' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.bookingName.trim()) { toast.error('Booking name is required.'); return; }
    onSave({ ...form, cost: Number(form.cost) || 0 });
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
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Actual Cost (₹) — fill after completion</label>
          <input data-testid="booking-cost-input" type="number" min="0" placeholder="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
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
// onEdit is passed from TripDetails and opens the EditBookingModal
const BookingsSection = ({ bookings, onAdd, onDelete, onEdit }) => {
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
            <div key={booking._id} className="flex items-start gap-2">
              <div className="flex-1"><BookingCard booking={booking} onDelete={onDelete} /></div>
              <button onClick={() => onEdit(booking)} className="mt-1 text-blue-400 hover:text-blue-600 transition-colors shrink-0" aria-label="Edit booking"><Edit className="w-4 h-4" /></button>
            </div>
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
  // Edit modal state: null = closed, object = open with pre-filled data
  const [editingTrip, setEditingTrip]         = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingBooking, setEditingBooking]   = useState(null);

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

  // handleUpdateActivity: called by EditActivityModal onSave
  const handleUpdateActivity = async (updatedData) => {
    try {
      const result = await updateActivity(editingActivity._id, updatedData);
      setActivities((prev) => prev.map((a) => (a._id === editingActivity._id ? result.data : a)));
      setEditingActivity(null);
      toast.success('Activity updated!');
    } catch {
      toast.error('Failed to update activity.');
    }
  };

  // handleUpdateBooking: called by EditBookingModal onSave
  const handleUpdateBooking = async (updatedData) => {
    try {
      const result = await updateBooking(editingBooking._id, updatedData);
      setBookings((prev) => prev.map((b) => (b._id === editingBooking._id ? result.data : b)));
      setEditingBooking(null);
      toast.success('Booking updated!');
    } catch {
      toast.error('Failed to update booking.');
    }
  };

  // handleUpdateTrip: called by EditTripModal onSave
  const handleUpdateTrip = async (updatedData) => {
    try {
      const result = await updateTrip(id, updatedData);
      setTrip(result.data);
      setEditingTrip(null);
      toast.success('Trip updated!');
    } catch {
      toast.error('Failed to update trip.');
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

        <TripHeader trip={trip} onDelete={handleDeleteTrip} onEdit={() => setEditingTrip(trip)} />
        <StatsRow activitiesCount={activities.length} bookingsCount={bookings.length} daysRemaining={daysRemaining} />

        {/* ── Budget Summary Panel ── */}
        {(() => {
          const activitySpend = activities.reduce((s, a) => s + (a.cost || 0), 0);
          const bookingSpend  = bookings.reduce((s, b)  => s + (b.cost || 0), 0);
          const totalSpent    = activitySpend + bookingSpend;
          const estimated     = trip.estimatedBudget || 0;
          const pct           = estimated > 0 ? Math.min(100, Math.round((totalSpent / estimated) * 100)) : null;
          const over          = estimated > 0 && totalSpent > estimated;
          if (totalSpent === 0 && estimated === 0) return null;
          return (
            <div className="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-slate-900">Budget Summary</h2>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Estimated</p>
                  <p className="text-xl font-bold text-slate-700 flex items-center justify-center gap-0.5"><IndianRupee className="w-4 h-4" />{estimated.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Spent So Far</p>
                  <p className={`text-xl font-bold flex items-center justify-center gap-0.5 ${over ? 'text-red-600' : 'text-green-600'}`}><IndianRupee className="w-4 h-4" />{totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">{over ? 'Over by' : 'Remaining'}</p>
                  <p className={`text-xl font-bold flex items-center justify-center gap-0.5 ${over ? 'text-red-600' : 'text-slate-700'}`}><IndianRupee className="w-4 h-4" />{Math.abs(estimated - totalSpent).toLocaleString('en-IN')}</p>
                </div>
              </div>
              {pct !== null && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Activities: ₹{activitySpend.toLocaleString('en-IN')} &nbsp;·&nbsp; Bookings: ₹{bookingSpend.toLocaleString('en-IN')}</span>
                    <span className={over ? 'text-red-600 font-semibold' : 'text-slate-600'}>{pct}% used</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Edit modals – rendered as full-screen overlays when editingX is set */}
        {editingTrip    && <EditTripModal    trip={editingTrip}       onSave={handleUpdateTrip}    onClose={() => setEditingTrip(null)} />}
        {editingActivity && <EditActivityModal activity={editingActivity} onSave={handleUpdateActivity} onClose={() => setEditingActivity(null)} />}
        {editingBooking  && <EditBookingModal  booking={editingBooking}  onSave={handleUpdateBooking}  onClose={() => setEditingBooking(null)} />}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <ItinerarySection activities={activities} onAdd={handleAddActivity} onDelete={handleDeleteActivity} onEdit={(act) => setEditingActivity(act)} />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <BookingsSection bookings={bookings} onAdd={handleAddBooking} onDelete={handleDeleteBooking} onEdit={(bk) => setEditingBooking(bk)} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripDetails;
