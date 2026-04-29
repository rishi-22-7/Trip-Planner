/*
  AdminUserTrips.jsx – Read-only table of all user trips for admin monitoring.
  Fetches from GET /api/admin/trips which returns trips with user info embedded.
  Admins can see who owns which trip, its status, and its destination.
*/
import { useState, useEffect } from 'react';
import { Plane, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllAdminTrips } from '../../services/adminService';
import { getTripStatus, getStatusBadgeClass, formatDateShort } from '../../utils/helperFunctions';

const AdminUserTrips = () => {
  const [trips, setTrips]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getAllAdminTrips();
        setTrips(data.data || []);
      } catch {
        toast.error('Failed to load trips.');
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((t) =>
    t.tripName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Monitor User Trips</h2>
          <p className="text-sm text-slate-500">Read-only view of all trips across the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips or users…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((n) => <div key={n} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Trip Name', 'User', 'Destination', 'Dates', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No trips found.</td></tr>
                ) : filteredTrips.map((trip) => {
                  const status     = getTripStatus(trip.startDate, trip.endDate);
                  const badgeClass = getStatusBadgeClass(status);
                  return (
                    <tr key={trip._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{trip.tripName}</td>
                      <td className="px-4 py-3 text-slate-500">{trip.userId?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{trip.destination}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTrips;
