/*
  ActivityCard.jsx – Displays a single activity item in the TripDetails itinerary.
  Props: activity { _id, activityName, activityDate, location, description, cost }
         onDelete(activityId) – called when the delete button is clicked
  The green cost badge is shown when cost > 0, making actual spend visible at a glance.
*/
import { Calendar, MapPin, Trash2, IndianRupee } from 'lucide-react';
import { formatDateLong } from '../utils/helperFunctions';

const ActivityCard = ({ activity, onDelete }) => (
  <article
    data-testid={`activity-card-${activity._id}`}
    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-2"
  >
    {/* Name + cost badge + delete */}
    <div className="flex items-start justify-between gap-3">
      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{activity.activityName}</h4>
      <div className="flex items-center gap-1.5 shrink-0">
        {activity.cost > 0 && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <IndianRupee className="w-3 h-3" />
            {activity.cost.toLocaleString('en-IN')}
          </span>
        )}
        <button
          onClick={() => onDelete(activity._id)}
          aria-label={`Delete ${activity.activityName}`}
          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
          data-testid={`delete-activity-${activity._id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
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
