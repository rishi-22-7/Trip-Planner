/*
  BookingCard.jsx – Displays a single booking (Hotel or Transport).
  For Transport: shows sub-mode badge (Flight/Train/Bus/Own Vehicle) and route info.
  For Hotel: shows check-in/out dates.
  Props: booking { _id, bookingType, transportMode, bookingName, checkInDate, checkOutDate,
                   departureAirport, arrivalAirport, departureTime, arrivalTime,
                   fromLocation, toLocation, travelDate, confirmationNumber, cost }
         onDelete(bookingId)
*/
import { Calendar, Trash2, Hash, IndianRupee, MapPin, Plane, Train, Bus, Car } from 'lucide-react';
import { formatDateShort } from '../utils/helperFunctions';

const TYPE_COLORS = {
  Hotel:     'bg-emerald-50 text-emerald-700',
  Transport: 'bg-amber-50 text-amber-700',
};

const MODE_COLORS = {
  Flight:       'bg-blue-50 text-blue-700',
  Train:        'bg-violet-50 text-violet-700',
  Bus:          'bg-orange-50 text-orange-700',
  'Own Vehicle':'bg-slate-100 text-slate-600',
};

const ModeIcon = ({ mode }) => {
  if (mode === 'Flight')      return <Plane  className="w-3 h-3" />;
  if (mode === 'Train')       return <Train  className="w-3 h-3" />;
  if (mode === 'Bus')         return <Bus    className="w-3 h-3" />;
  if (mode === 'Own Vehicle') return <Car    className="w-3 h-3" />;
  return null;
};

const BookingCard = ({ booking, onDelete }) => {
  const typeBadge = TYPE_COLORS[booking.bookingType] || TYPE_COLORS.Transport;
  const modeBadge = MODE_COLORS[booking.transportMode] || '';
  const isTransport = booking.bookingType === 'Transport';
  const isFlight    = isTransport && booking.transportMode === 'Flight';

  return (
    <article
      data-testid={`booking-card-${booking._id}`}
      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-2"
    >
      {/* Type badge + name + cost + delete */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge}`}>
              {booking.bookingType}
            </span>
            {isTransport && booking.transportMode && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${modeBadge}`}>
                <ModeIcon mode={booking.transportMode} />
                {booking.transportMode}
              </span>
            )}
          </div>
          <h4 className="font-semibold text-slate-900 text-sm">{booking.bookingName}</h4>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {booking.cost > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <IndianRupee className="w-3 h-3" />
              {booking.cost.toLocaleString('en-IN')}
            </span>
          )}
          <button
            onClick={() => onDelete(booking._id)}
            aria-label={`Delete booking ${booking.bookingName}`}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
            data-testid={`delete-booking-${booking._id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hotel: date range */}
      {!isTransport && booking.checkInDate && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDateShort(booking.checkInDate)}
          {booking.checkOutDate && booking.checkOutDate !== booking.checkInDate
            ? ` – ${formatDateShort(booking.checkOutDate)}`
            : ''}
        </p>
      )}

      {/* Transport: route */}
      {isTransport && (booking.fromLocation || booking.toLocation || booking.departureAirport || booking.arrivalAirport) && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {isFlight
            ? `${booking.departureAirport || '?'} → ${booking.arrivalAirport || '?'}`
            : `${booking.fromLocation || '?'} → ${booking.toLocation || '?'}`}
          {isFlight && booking.departureTime && ` · ${booking.departureTime}`}
        </p>
      )}

      {/* Transport: travel date */}
      {isTransport && booking.travelDate && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDateShort(booking.travelDate)}
        </p>
      )}

      {/* Confirmation number */}
      {booking.confirmationNumber && (
        <p className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          {booking.confirmationNumber}
        </p>
      )}
    </article>
  );
};

export default BookingCard;

