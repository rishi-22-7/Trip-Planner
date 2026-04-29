/*
  CreateTrip.jsx – Form to create a new trip.
  Submits to TripContext.addTrip() → tripService.createTrip() → POST /api/trips.

  Pre-fills the destination field if a ?destination= query param is present
  (passed from DestinationCard's "Plan a Trip Here" button on Home/DestinationPage).

  If the destination has a pre-seeded itinerary (authored by an admin), a
  dismissible banner offers to auto-populate the trip's activities from it.
  When accepted, the itinerary is passed as `seededActivities` in the API
  payload and the server bulk-inserts them as Activity documents.
*/
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Plane, Sparkles, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useTrips } from '../context/TripContext';
import { getAllDestinations } from '../services/destinationService';
import { isRequired, isValidDateRange, isPositiveNumber } from '../utils/validators';

const TRIP_TYPES = ['Solo', 'Couple', 'Family', 'Group'];

// ─── Itinerary Preview Banner ─────────────────────────────────────────────────
// Shown when the selected destination has a pre-seeded itinerary template.
// The user can expand to preview the days, then apply or dismiss.
const ItineraryBanner = ({ itinerary, onApply, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-5 border border-blue-200 bg-blue-50 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900">Pre-planned Itinerary Available</p>
          <p className="text-xs text-blue-600 mt-0.5">
            This destination has a {itinerary.length}-day template ready to apply.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-blue-500 hover:text-blue-700 transition-colors shrink-0"
          aria-label={expanded ? 'Collapse itinerary preview' : 'Expand itinerary preview'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors shrink-0"
          aria-label="Dismiss itinerary banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable preview */}
      {expanded && (
        <div className="border-t border-blue-100 px-4 py-3 space-y-2 max-h-56 overflow-y-auto">
          {itinerary.map((dayEntry) => (
            <div key={dayEntry.day}>
              <p className="text-xs font-bold text-blue-700 mb-1">Day {dayEntry.day}</p>
              <ul className="space-y-0.5 pl-3">
                {dayEntry.activities.map((act, i) => (
                  <li key={i} className="text-xs text-blue-800 flex items-start gap-1.5">
                    <span className="mt-0.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="border-t border-blue-100 flex gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={onApply}
          className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Yes, apply itinerary
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          No thanks, I'll plan myself
        </button>
      </div>
    </div>
  );
};

// ─── Applied Itinerary Confirmation ──────────────────────────────────────────
// Shown after the user clicks "Yes, apply itinerary" — a small green badge.
const ItineraryAppliedBadge = ({ count, onUndo }) => (
  <div className="mb-5 flex items-center gap-3 px-4 py-2.5 border border-green-200 bg-green-50 rounded-xl">
    <Check className="w-4 h-4 text-green-600 shrink-0" />
    <p className="text-sm text-green-800 flex-1">
      <span className="font-semibold">{count} activities</span> from the itinerary template will be added to your trip.
    </p>
    <button type="button" onClick={onUndo} className="text-xs text-green-600 hover:underline shrink-0">
      Undo
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateTrip = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { addTrip }     = useTrips();

  const destParam = searchParams.get('destination') || '';

  const [formData, setFormData] = useState({
    tripName:    '',
    destination: destParam,
    startDate:   '',
    endDate:     '',
    budget:      '',
    tripType:    'Solo',
    description: '',
  });
  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Itinerary state ────────────────────────────────────────────────────────
  // preseededItinerary: the template loaded from the matched destination (null = none)
  // itineraryApplied:  true = user accepted → seededActivities will be sent on submit
  // bannerDismissed:   true = user clicked "No thanks" → hide banner entirely
  const [preseededItinerary, setPreseededItinerary] = useState(null);
  const [itineraryApplied, setItineraryApplied]     = useState(false);
  const [bannerDismissed, setBannerDismissed]       = useState(false);

  // On mount: if a destination param is present, look it up and check for an itinerary
  useEffect(() => {
    if (!destParam) return;

    const fetchItinerary = async () => {
      try {
        const res = await getAllDestinations();
        const destinations = res.data || [];
        // Case-insensitive match on destination name
        const matched = destinations.find(
          (d) => d.destinationName.toLowerCase() === destParam.toLowerCase()
        );
        if (matched?.itinerary && matched.itinerary.length > 0) {
          setPreseededItinerary(matched.itinerary);
        }
      } catch {
        // Silently fail — the user can still create the trip without the template
      }
    };
    fetchItinerary();
  }, [destParam]);

  // Count total activity strings across all days (for the "applied" badge)
  const totalSeededActivities = preseededItinerary
    ? preseededItinerary.reduce((sum, d) => sum + (d.activities?.length || 0), 0)
    : 0;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isRequired(formData.tripName))    newErrors.tripName    = 'Trip name is required.';
    if (!isRequired(formData.destination)) newErrors.destination = 'Destination is required.';
    if (!isRequired(formData.startDate))   newErrors.startDate   = 'Start date is required.';
    if (!isRequired(formData.endDate))     newErrors.endDate     = 'End date is required.';
    if (formData.startDate && formData.endDate && !isValidDateRange(formData.startDate, formData.endDate)) {
      newErrors.endDate = 'End date must be on or after the start date.';
    }
    if (formData.budget && !isPositiveNumber(formData.budget)) {
      newErrors.budget = 'Budget must be a positive number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { budget, ...rest } = formData;
      const payload = {
        ...rest,
        // Server / Trip model expects `estimatedBudget`, not `budget`
        estimatedBudget: budget ? Number(budget) : 0,
        // Only send seededActivities if the user explicitly accepted the template
        ...(itineraryApplied && preseededItinerary
          ? { seededActivities: preseededItinerary }
          : {}),
      };
      const newTrip = await addTrip(payload);
      toast.success(
        itineraryApplied
          ? `Trip created with ${totalSeededActivities} pre-planned activities!`
          : 'Trip created successfully!'
      );
      navigate(`/trips/${newTrip.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
  const inputClass  = (field) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
      errors[field] ? 'border-red-400' : 'border-slate-300'
    }`;

  // Determine banner visibility:
  // Show banner  → destination has an itinerary AND user hasn't dismissed AND hasn't already applied
  const showBanner  = preseededItinerary && !bannerDismissed && !itineraryApplied;
  const showApplied = itineraryApplied && preseededItinerary;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Plan a New Trip</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details to get started.</p>
        </div>

        {/* ── Itinerary banner (shown when destination has template) ── */}
        {showBanner && (
          <ItineraryBanner
            itinerary={preseededItinerary}
            onApply={() => setItineraryApplied(true)}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* ── Applied confirmation badge ── */}
        {showApplied && (
          <ItineraryAppliedBadge
            count={totalSeededActivities}
            onUndo={() => { setItineraryApplied(false); setBannerDismissed(false); }}
          />
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <form onSubmit={handleTripSubmit} noValidate className="space-y-5">

            {/* Trip name */}
            <div>
              <label htmlFor="trip-name" className={labelClass}>Trip Name</label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="trip-name"
                  type="text"
                  placeholder="e.g. Goa Summer Getaway"
                  value={formData.tripName}
                  onChange={(e) => handleFieldChange('tripName', e.target.value)}
                  className={`${inputClass('tripName')} pl-10`}
                />
              </div>
              {errors.tripName && <p className="mt-1 text-xs text-red-500">{errors.tripName}</p>}
            </div>

            {/* Destination */}
            <div>
              <label htmlFor="destination" className={labelClass}>Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="destination"
                  type="text"
                  placeholder="e.g. Goa, India"
                  value={formData.destination}
                  onChange={(e) => handleFieldChange('destination', e.target.value)}
                  className={`${inputClass('destination')} pl-10`}
                />
              </div>
              {errors.destination && <p className="mt-1 text-xs text-red-500">{errors.destination}</p>}
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className={labelClass}>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start Date</span>
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className={inputClass('startDate')}
                />
                {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
              </div>
              <div>
                <label htmlFor="end-date" className={labelClass}>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> End Date</span>
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  className={inputClass('endDate')}
                />
                {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
              </div>
            </div>

            {/* Budget + Trip type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className={labelClass}>
                  <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Budget (optional)</span>
                </label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={formData.budget}
                  onChange={(e) => handleFieldChange('budget', e.target.value)}
                  className={inputClass('budget')}
                />
                {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget}</p>}
              </div>
              <div>
                <label htmlFor="trip-type" className={labelClass}>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Trip Type</span>
                </label>
                <select
                  id="trip-type"
                  value={formData.tripType}
                  onChange={(e) => handleFieldChange('tripType', e.target.value)}
                  className={inputClass('tripType')}
                >
                  {TRIP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelClass}>Description (optional)</label>
              <textarea
                id="description"
                rows={3}
                placeholder="What's the purpose of this trip?"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/trips')} className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                {isSubmitting ? 'Creating…' : 'Create Trip'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateTrip;


