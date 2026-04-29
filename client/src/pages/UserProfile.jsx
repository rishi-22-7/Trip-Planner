/*
  UserProfile.jsx – User account details + Change Password (Security section).
  Reads from AuthContext. changePassword() calls PUT /api/auth/change-password.
*/
import { useState } from 'react';
import { User, Mail, Shield, LogOut, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';
import { isValidPassword, doPasswordsMatch } from '../utils/validators';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Change Password form state ──────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out.'); navigate('/'); };

  const validatePwForm = () => {
    const errs = {};
    if (!pwForm.current.trim())           errs.current = 'Current password is required.';
    if (!isValidPassword(pwForm.newPw))   errs.newPw   = 'New password must be at least 6 characters.';
    if (!doPasswordsMatch(pwForm.newPw, pwForm.confirm)) errs.confirm = 'Passwords do not match.';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePwForm()) return;
    setSaving(true);
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      toast.success('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const inputClass = (field) =>
    `w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      pwErrors[field] ? 'border-red-400' : 'border-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

        {/* ── Account Info Card ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-5">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {initial}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${user?.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                {user?.role === 'admin' ? 'Administrator' : 'Traveller'}
              </span>
            </div>
          </div>

          <dl className="divide-y divide-slate-100">
            {[
              { icon: User,   label: 'Full Name', value: user?.name  },
              { icon: Mail,   label: 'Email',     value: user?.email },
              { icon: Shield, label: 'Role',      value: user?.role  },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center py-3">
                <dt className="flex items-center gap-2 w-36 text-sm text-slate-500 shrink-0">
                  <Icon className="w-4 h-4 text-slate-400" /> {label}
                </dt>
                <dd className="text-sm font-medium text-slate-900">{value || '—'}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Security / Change Password Card ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" /> Security
          </h3>
          <p className="text-sm text-slate-500 mb-5">Change your account password.</p>

          <form onSubmit={handleChangePassword} noValidate className="space-y-4">
            {/* Shared password field renderer */}
            {[
              { id: 'cur-pw',  label: 'Current Password', key: 'current', placeholder: 'Your current password'  },
              { id: 'new-pw',  label: 'New Password',      key: 'newPw',   placeholder: 'At least 6 characters'   },
              { id: 'con-pw',  label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat new password' },
            ].map(({ id, label, key, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id={id}
                    type={showPw ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                    className={inputClass(key)}
                  />
                  {/* Toggle visibility button on the last field only */}
                  {key === 'confirm' && (
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {pwErrors[key] && <p className="mt-1 text-xs text-red-500">{pwErrors[key]}</p>}
              </div>
            ))}

            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              {saving ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
