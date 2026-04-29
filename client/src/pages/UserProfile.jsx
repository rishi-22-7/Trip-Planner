/*
  UserProfile.jsx – Shows the logged-in user's account details.
  Reads user data from AuthContext (no API call needed).
  Displays name, email, role badge, and a logout button.
*/
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  // Initial letter for the avatar circle
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your account details</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

          {/* Avatar + name */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {initial}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${
                user?.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : 'Traveller'}
              </span>
            </div>
          </div>

          {/* Details */}
          <dl className="divide-y divide-slate-100 mt-1">
            {[
              { icon: User,   label: 'Full Name', value: user?.name  },
              { icon: Mail,   label: 'Email',     value: user?.email },
              { icon: Shield, label: 'Role',      value: user?.role  },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center py-3.5">
                <dt className="flex items-center gap-2 w-32 text-sm text-slate-500 shrink-0">
                  <Icon className="w-4 h-4 text-slate-400" /> {label}
                </dt>
                <dd className="text-sm font-medium text-slate-900">{value || '—'}</dd>
              </div>
            ))}
          </dl>

          {/* Actions */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
