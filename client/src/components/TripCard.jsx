/*
  TripCard.jsx – Reusable summary card displayed in the Dashboard grid.
  Receives a single trip object and renders its name, destination, dates,
  status badge, and a "View Details" button.
  Props: trip { _id, tripName, destination, startDate, endDate }
*/
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { formatDateShort, getTripStatus, getStatusBadgeClass, calculateTripDuration } from '../utils/helperFunctions';

const TripCard = ({ trip }) => {
  const navigate    = useNavigate();
  const status      = getTripStatus(trip.startDate, trip.endDate);
  const badgeClass  = getStatusBadgeClass(status);
  const duration    = calculateTripDuration(trip.startDate, trip.endDate);

  const handleViewDetails = () => navigate(`/trips/${trip._id}`);

  return (
    <article
      data-testid={`trip-card-${trip._id}`}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 card-hover group cursor-pointer"
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
          {trip.tripName}
        </h3>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {status}
        </span>
      </div>

      {/* Meta */}
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-blue-400 transition-colors" />
          {trip.destination}
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          {formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)}
          <span className="text-slate-400">({duration} days)</span>
        </p>
      </div>

      {/* Action */}
      <button
        onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
        data-testid={`view-trip-${trip._id}`}
        className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all group-hover:gap-2"
      >
        View Details <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </article>
  );
};

export default TripCard;
