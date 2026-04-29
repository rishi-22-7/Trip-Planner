/*
  DestinationModal.jsx – Centered overlay modal showing detailed info
  about a destination including its complete sample itinerary.
  Rendered via a React Portal to escape parent transform contexts.
  Props:
    destination – the full destination object
    onClose     – callback to dismiss the modal
    onPlanTrip  – optional callback; if present, renders a CTA button
*/
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, MapPin, CalendarDays, CheckCircle2,
  ArrowRight, Clock, Sparkles,
} from 'lucide-react';

const DestinationModal = ({ destination, onClose, onPlanTrip }) => {
  const hasItinerary = destination.itinerary?.length > 0;

  /* Lock body scroll while modal is open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Close on Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const modalContent = (
    /* Backdrop – full viewport, centered flex */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}
    >
      {/* Modal panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-modal-in"
      >
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white shrink-0">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition-all hover:scale-110 hover:rotate-90"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{destination.destinationName}</h2>
              {hasItinerary && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-100">
                  <Clock className="w-3 h-3" />
                  {destination.itinerary.length} day{destination.itinerary.length !== 1 ? 's' : ''} itinerary
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Scrollable body ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Description */}
          {destination.description && (
            <div className="animate-fade-in-up delay-50">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">About</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{destination.description}</p>
            </div>
          )}

          {/* Itinerary */}
          {hasItinerary && (
            <div className="animate-fade-in-up delay-100">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Sample Itinerary
              </h3>

              <div className="space-y-3">
                {destination.itinerary.map((dayEntry) => (
                  <div
                    key={dayEntry.day}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:shadow-sm"
                  >
                    {/* Day badge */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-lg text-xs font-bold">
                        {dayEntry.day}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        Day {dayEntry.day}
                      </span>
                    </div>

                    {/* Activities */}
                    <ul className="space-y-2 pl-1">
                      {dayEntry.activities.filter(Boolean).map((act, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                      {dayEntry.activities.filter(Boolean).length === 0 && (
                        <li className="text-xs text-slate-400 italic">No activities listed</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no itinerary */}
          {!hasItinerary && (
            <div className="text-center py-8 animate-fade-in">
              <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-slate-400">No sample itinerary available for this destination yet.</p>
            </div>
          )}
        </div>

        {/* ─── Footer CTA ────────────────────────────────────────── */}
        {onPlanTrip && (
          <div className="shrink-0 border-t border-slate-200 px-6 py-4 bg-slate-50">
            <button
              onClick={() => onPlanTrip(destination.destinationName)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            >
              Plan a Trip Here <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Portal to document.body so the modal escapes any parent transform/grid context
  return createPortal(modalContent, document.body);
};

export default DestinationModal;
