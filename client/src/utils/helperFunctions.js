/*
  helperFunctions.js – Pure utility functions for formatting and classification.
  Used across TripCard, TripDetails, Dashboard, and TripHistory to avoid
  duplicating the same logic in every component.
*/

// Returns a short date string like "May 10"
export const formatDateShort = (isoDate) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Returns a long date string like "May 10, 2026"
export const formatDateLong = (isoDate) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Returns the number of days between two ISO date strings
export const calculateTripDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const diff = new Date(endDate) - new Date(startDate);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Returns "Upcoming", "Ongoing", or "Completed" based on today's date
export const getTripStatus = (startDate, endDate) => {
  const now   = new Date();
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (end < now)   return 'Completed';
  if (start > now) return 'Upcoming';
  return 'Ongoing';
};

// Returns a Tailwind badge class for a given trip status
export const getStatusBadgeClass = (status) => {
  const map = {
    Upcoming:  'bg-blue-50 text-blue-700 border border-blue-200',
    Ongoing:   'bg-green-50 text-green-700 border border-green-200',
    Completed: 'bg-gray-100 text-gray-600 border border-gray-200',
  };
  return map[status] || map.Upcoming;
};

// Formats a number as a currency string with commas (e.g., 50000 → "50,000")
export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
};
