/*
  AdminReports.jsx – Platform statistics and reporting panel.
  Fetches live stats from GET /api/admin/stats and displays them in cards.
  The "Download Report" button demonstrates the pattern – extend it to
  hit a real export endpoint when the backend supports it.
*/
import { useState, useEffect } from 'react';
import { BarChart2, Users, Plane, MapPin, Download, RefreshCw } from 'lucide-react';
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

  // Mock "Download Report" – extend to call a backend export endpoint
  const handleDownloadReport = () => {
    toast.success('Report download initiated (backend endpoint required).');
  };

  const statCards = stats
    ? [
        { icon: Users,    label: 'Total Users',        value: stats.totalUsers    ?? '—', color: 'text-blue-600',  bg: 'bg-blue-50'   },
        { icon: Plane,    label: 'Total Trips',         value: stats.totalTrips    ?? '—', color: 'text-green-600', bg: 'bg-green-50'  },
        { icon: MapPin,   label: 'Total Destinations',  value: stats.totalDests    ?? '—', color: 'text-amber-600', bg: 'bg-amber-50'  },
        { icon: BarChart2,label: 'Total Bookings',      value: stats.totalBookings ?? '—', color: 'text-purple-600',bg: 'bg-purple-50' },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Platform Reports</h2>
          <p className="text-sm text-slate-500">Live statistics and downloadable reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStats} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleDownloadReport} className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((n) => <div key={n} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Most Popular Destinations */}
          {stats?.popularDestinations?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Most Popular Destinations
              </h3>
              <div className="space-y-3">
                {stats.popularDestinations.map((dest, index) => (
                  <div key={dest.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center justify-center shrink-0">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 truncate">{dest.name}</span>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">{dest.count} trips</span>
                      </div>
                      {/* Visual bar proportional to trip count */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (dest.count / (stats.popularDestinations[0]?.count || 1)) * 100)}%` }} />
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
