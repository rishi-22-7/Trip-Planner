/*
  BookingCard.jsx – Displays a single booking (Hotel/Flight/Transport/Other).
  Shows a type badge, booking name, dates, and confirmation number.
  Props: booking { _id, bookingType, bookingName, checkInDate, checkOutDate, confirmationNumber }
         onDelete(bookingId) – called when the delete button is clicked
*/
import { Calendar, Trash2, Hash } from 'lucide-react';
import { formatDateShort } from '../utils/helperFunctions';

// Maps booking type to a color scheme
const TYPE_COLORS = {
  Hotel:     'bg-emerald-50 text-emerald-700',
  Flight:    'bg-blue-50 text-blue-700',
  Transport: 'bg-amber-50 text-amber-700',
  Other:     'bg-slate-100 text-slate-600',
};

const BookingCard = ({ booking, onDelete }) => {
  const badgeClass = TYPE_COLORS[booking.bookingType] || TYPE_COLORS.Other;

  return (
    <article
      data-testid={`booking-card-${booking._id}`}
      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-2"
    >
      {/* Type badge + name + delete */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {booking.bookingType}
          </span>
          <h4 className="font-semibold text-slate-900 text-sm">{booking.bookingName}</h4>
        </div>
        <button
          onClick={() => onDelete(booking._id)}
          aria-label={`Delete booking ${booking.bookingName}`}
          className="shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
          data-testid={`delete-booking-${booking._id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Date range */}
      {booking.checkInDate && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDateShort(booking.checkInDate)}
          {booking.checkOutDate && booking.checkOutDate !== booking.checkInDate
            ? ` – ${formatDateShort(booking.checkOutDate)}`
            : ''}
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
