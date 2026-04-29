/*
  DestinationCard.jsx – Reusable card for a single destination.
  Displays name, description, itinerary day-count badge, and a
  "View Itinerary" button that opens a full-detail modal.
  Used by Home.jsx and DestinationPage.jsx.
  Props: destination { _id, destinationName, description, itinerary[] }
*/
import { useState } from 'react';
import { MapPin, ArrowRight, CalendarDays, Eye } from 'lucide-react';
import DestinationModal from './DestinationModal';

const DestinationCard = ({ destination, onPlanTrip }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const hasItinerary = destination.itinerary?.length > 0;

  return (
    <>
      <article
        data-testid={`destination-card-${destination._id}`}
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 card-hover group"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
            {destination.destinationName}
          </h3>
        </div>

        {/* Description */}
        {destination.description && (
          <p className="text-sm text-slate-500 leading-relaxed">{destination.description}</p>
        )}

        {/* Itinerary info + View Itinerary */}
        {hasItinerary && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">
                {destination.itinerary.length}-Day Sample Itinerary
              </span>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-md transition-all hover:shadow-sm active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" /> View Itinerary
            </button>
          </div>
        )}

        {/* View Details when no itinerary */}
        {!hasItinerary && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
        )}

        {/* CTA */}
        {onPlanTrip && (
          <button
            onClick={() => onPlanTrip(destination.destinationName)}
            className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:gap-2 active:scale-95"
          >
            Plan a Trip Here <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </article>

      {/* Detail modal */}
      {modalOpen && (
        <DestinationModal
          destination={destination}
          onClose={() => setModalOpen(false)}
          onPlanTrip={onPlanTrip}
        />
      )}
    </>
  );
};

export default DestinationCard;
