/*
  AdminDashboard.jsx – Table-based admin panel for monitoring users and destinations.
  Fetches admin stats, all users, and all destinations concurrently.
  Accessible only to users with role === 'admin' (enforced by AdminRoute in routes.jsx).
*/
import { useState, useEffect } from 'react';
import { Shield, Users, Globe, Plane, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats]               = useState(null);
  const [users, setUsers]               = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, destRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/destinations'),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data || []);
        setDestinations(destRes.data.data || []);
      } catch {
        toast.error('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeleteDestination = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await api.delete(`/destinations/${id}`);
      setDestinations((prev) => prev.filter((d) => d._id !== id));
      toast.success('Destination deleted.');
    } catch {
      toast.error('Failed to delete destination.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">System overview and management</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map((n) => <div key={n} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-20" />)}
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users',       value: stats?.totalUsers    || 0, icon: Users  },
                { label: 'Total Trips',       value: stats?.totalTrips    || 0, icon: Plane  },
                { label: 'Destinations',      value: destinations.length,       icon: Globe  },
                { label: 'Total Bookings',    value: stats?.totalBookings || 0, icon: Shield },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-slate-500">{label}</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Users table */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> Registered Users
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No users found.</td></tr>
                    ) : users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="px-5 py-3 text-slate-500">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Destinations table */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" /> Destinations
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Name', 'Description', 'Actions'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {destinations.length === 0 ? (
                      <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400">No destinations found.</td></tr>
                    ) : destinations.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">{d.destinationName}</td>
                        <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{d.description}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleDeleteDestination(d._id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
