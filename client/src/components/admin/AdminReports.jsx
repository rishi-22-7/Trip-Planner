/*
  AdminReports.jsx – Platform statistics and a month-wise trips bar chart.
  Fetches from GET /api/admin/stats which already returns:
    - totalUsers (non-admin), totalTrips, monthlyTrips[], topDestinations[]
  No bookings stat shown here — focused on users and trips.
*/
import { useState, useEffect } from 'react';
import { Users, Plane, TrendingUp, RefreshCw, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminStats } from '../../services/adminService';

const AdminReports = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data.data);
    } catch {
      toast.error('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = stats
    ? [
        {
          icon: Users,
          label: 'Total Users',
          value: stats.totalUsers ?? '—',
          sub: 'Registered travellers',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
        },
        {
          icon: Plane,
          label: 'Total Trips',
          value: stats.totalTrips ?? '—',
          sub: `${stats.activeTrips ?? 0} currently active`,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
        },
      ]
    : [];

  // Bar chart helpers
  const monthlyTrips  = stats?.monthlyTrips || [];
  const maxBarCount   = Math.max(...monthlyTrips.map((m) => m.count), 1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Platform Reports</h2>
          <p className="text-sm text-slate-500">Live statistics and trip trends.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((n) => <div key={n} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
          <div className="h-56 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {statCards.map(({ icon: Icon, label, value, sub, color, bg, border }) => (
              <div
                key={label}
                className={`bg-white border ${border} rounded-xl p-6 shadow-sm flex items-center gap-4`}
              >
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{value}</p>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Month-wise trips bar chart */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Trips Created — Last 6 Months
            </h3>
            <p className="text-xs text-slate-400 mb-6">Number of new trips created each month.</p>

            <div className="flex items-end gap-3 h-44">
              {monthlyTrips.map(({ month, count }) => {
                const heightPct = maxBarCount > 0 ? (count / maxBarCount) * 100 : 0;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                    {/* Value label */}
                    <span className="text-xs font-semibold text-slate-700">
                      {count > 0 ? count : ''}
                    </span>
                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '140px' }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-700"
                        style={{ height: `${heightPct}%`, minHeight: count > 0 ? '4px' : '0' }}
                      />
                    </div>
                    {/* Month label */}
                    <span className="text-xs text-slate-500 font-medium">{month}</span>
                  </div>
                );
              })}
            </div>

            {monthlyTrips.every((m) => m.count === 0) && (
              <p className="text-center text-sm text-slate-400 mt-4">No trips recorded in the last 6 months.</p>
            )}
          </div>

          {/* Top Destinations */}
          {stats?.topDestinations?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Top Destinations
              </h3>
              <div className="space-y-3">
                {stats.topDestinations.map((dest, index) => (
                  <div key={dest.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 truncate">{dest.name}</span>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">{dest.count} trip{dest.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${dest.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReports;
