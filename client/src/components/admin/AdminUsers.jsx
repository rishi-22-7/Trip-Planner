/*
  AdminUsers.jsx – Read-only table of all non-admin users.
  Admins can see name, email, join date, and number of trips.
  Fetches from GET /api/admin/users which already excludes admin accounts.
*/
import { useState, useEffect } from 'react';
import { Users, Search, Mail, Calendar, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllUsers } from '../../services/adminService';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const AdminUsers = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data.data || []);
      } catch {
        toast.error('Failed to load users.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">
            All registered travellers on the platform.
            {!loading && (
              <span className="ml-1 font-medium text-slate-700">({users.length} total)</span>
            )}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-500 font-medium">
            {searchQuery ? 'No users match your search.' : 'No users registered yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    { label: 'Name',       icon: null },
                    { label: 'Email',      icon: Mail },
                    { label: 'Joined',     icon: Calendar },
                    { label: 'Trips',      icon: Plane },
                  ].map(({ label, icon: Icon }) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1.5">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-slate-900 whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Trip count badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.tripCount > 0
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Plane className="w-3 h-3" />
                        {user.tripCount} trip{user.tripCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
