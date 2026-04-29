/*
  CreateTrip.jsx – Form to create a new trip.
  Submits to TripContext.addTrip() → tripService.createTrip() → POST /api/trips.
  Pre-fills the destination field if a ?destination= query param is present
  (passed from DestinationCard's "Plan a Trip Here" button on Home/DestinationPage).
*/
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useTrips } from '../context/TripContext';
import { isRequired, isValidDateRange, isPositiveNumber } from '../utils/validators';

const TRIP_TYPES = ['Solo', 'Couple', 'Family', 'Group'];

const CreateTrip = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { addTrip }     = useTrips();

  const [formData, setFormData] = useState({
    tripName:    '',
    destination: searchParams.get('destination') || '',
    startDate:   '',
    endDate:     '',
    budget:      '',
    tripType:    'Solo',
    description: '',
  });
  const [errors, setErrors]         = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
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
      const newTrip = await addTrip(formData);
      toast.success('Trip created successfully!');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Plan a New Trip</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details to get started.</p>
        </div>

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
