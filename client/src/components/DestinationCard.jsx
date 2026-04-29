/*
  DestinationCard.jsx – Reusable card for a single destination.
  Displays the name, description, and recommended places chips.
  Used by Home.jsx and DestinationPage.jsx.
  Props: destination { _id, destinationName, description, recommendedPlaces[] }
*/
import { MapPin, ArrowRight } from 'lucide-react';

const DestinationCard = ({ destination, onPlanTrip }) => (
  <article
    data-testid={`destination-card-${destination._id}`}
    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-4"
  >
    {/* Header */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
        <MapPin className="w-4 h-4 text-blue-600" />
      </div>
      <h3 className="font-semibold text-slate-900 text-base">{destination.destinationName}</h3>
    </div>

    {/* Description */}
    {destination.description && (
      <p className="text-sm text-slate-500 leading-relaxed">{destination.description}</p>
    )}

    {/* Recommended places */}
    {destination.recommendedPlaces?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recommended</p>
        <div className="flex flex-wrap gap-1.5">
          {destination.recommendedPlaces.map((place) => (
            <span key={place} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {place}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* CTA */}
    {onPlanTrip && (
      <button
        onClick={() => onPlanTrip(destination.destinationName)}
        className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        Plan a Trip Here <ArrowRight className="w-4 h-4" />
      </button>
    )}
  </article>
);

export default DestinationCard;
