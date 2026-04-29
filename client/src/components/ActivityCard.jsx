/*
  ActivityCard.jsx – Displays a single activity item in the TripDetails itinerary.
  Props: activity { _id, activityName, activityDate, location, description }
         onDelete(activityId) – called when the delete button is clicked
*/
import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { formatDateLong } from '../utils/helperFunctions';

const ActivityCard = ({ activity, onDelete }) => (
  <article
    data-testid={`activity-card-${activity._id}`}
    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-2"
  >
    {/* Name + delete */}
    <div className="flex items-start justify-between gap-3">
      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{activity.activityName}</h4>
      <button
        onClick={() => onDelete(activity._id)}
        aria-label={`Delete ${activity.activityName}`}
        className="shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
        data-testid={`delete-activity-${activity._id}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>

    {/* Location */}
    {activity.location && (
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="w-3.5 h-3.5 text-slate-400" />
        {activity.location}
      </p>
    )}

    {/* Date */}
    {activity.activityDate && (
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        {formatDateLong(activity.activityDate)}
      </p>
    )}

    {/* Description */}
    {activity.description && (
      <p className="text-xs text-slate-500 leading-relaxed">{activity.description}</p>
    )}
  </article>
);

export default ActivityCard;
