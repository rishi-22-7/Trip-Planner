/*
  UserProfile.jsx – User account details + Change Password (Security section).
  Reads from AuthContext. changePassword() calls PUT /api/auth/change-password.
  Allows editing Name, Email, and Profile Picture.
*/
import { useState, useRef } from 'react';
import { User, Mail, Shield, LogOut, Lock, Eye, EyeOff, Camera, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { changePassword, updateProfile } from '../services/authService';
import { isValidPassword, doPasswordsMatch, isRequired, isValidEmail } from '../utils/validators';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ── Profile Edit state ──────────────────────────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Change Password form state ──────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out.'); navigate('/'); };

  // Profile functions
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfileForm = () => {
    const errs = {};
    if (!isRequired(profileForm.name)) errs.name = 'Name is required.';
    if (!isRequired(profileForm.email)) errs.email = 'Email is required.';
    else if (!isValidEmail(profileForm.email)) errs.email = 'Enter a valid email address.';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    setSavingProfile(true);
    try {
      const data = await updateProfile(profileForm);
      updateUser(data.data.user);
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelEditProfile = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      profilePicture: user?.profilePicture || '',
    });
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  // Password functions
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
    setSavingPw(true);
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      toast.success('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const inputClass = (field, errors) =>
    `w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-slate-300'
    }`;

  const profileInputClass = (field) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      profileErrors[field] ? 'border-red-400' : 'border-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">

        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

        {/* ── Account Info Card ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 mb-4 gap-4">
            <div className="flex items-center gap-4 relative">
              <div className="relative group">
                {profileForm.profilePicture || user?.profilePicture ? (
                  <img 
                    src={isEditingProfile ? profileForm.profilePicture : user?.profilePicture} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {initial}
                  </div>
                )}
                
                {isEditingProfile && (
                  <div 
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{isEditingProfile ? profileForm.name || 'Your Name' : user?.name}</h2>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${user?.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Traveller'}
                </span>
              </div>
            </div>
            
            {!isEditingProfile ? (
              <button 
                onClick={() => setIsEditingProfile(true)} 
                className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={cancelEditProfile} 
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleUpdateProfile} 
                  disabled={savingProfile}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
                >
                  {savingProfile ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name Field */}
            <div className="flex flex-col sm:flex-row sm:items-center py-2">
              <div className="flex items-center gap-2 w-36 text-sm text-slate-500 shrink-0 mb-1 sm:mb-0">
                <User className="w-4 h-4 text-slate-400" /> Full Name
              </div>
              {isEditingProfile ? (
                <div className="flex-1 w-full max-w-sm">
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className={profileInputClass('name')}
                  />
                  {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name}</p>}
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-900">{user?.name}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col sm:flex-row sm:items-center py-2">
              <div className="flex items-center gap-2 w-36 text-sm text-slate-500 shrink-0 mb-1 sm:mb-0">
                <Mail className="w-4 h-4 text-slate-400" /> Email
              </div>
              {isEditingProfile ? (
                <div className="flex-1 w-full max-w-sm">
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className={profileInputClass('email')}
                  />
                  {profileErrors.email && <p className="mt-1 text-xs text-red-500">{profileErrors.email}</p>}
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-900">{user?.email}</div>
              )}
            </div>

            {/* Role Field (Never editable) */}
            <div className="flex items-center py-2">
              <div className="flex items-center gap-2 w-36 text-sm text-slate-500 shrink-0">
                <Shield className="w-4 h-4 text-slate-400" /> Role
              </div>
              <div className="text-sm font-medium text-slate-900">{user?.role}</div>
            </div>
          </div>

          {!isEditingProfile && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* ── Security / Change Password Card ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 animate-fade-in-up delay-100">
          <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" /> Security
          </h3>
          <p className="text-sm text-slate-500 mb-5">Change your account password.</p>

          <form onSubmit={handleChangePassword} noValidate className="space-y-4 max-w-md">
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
                    className={inputClass(key, pwErrors)}
                  />
                  {key === 'confirm' && (
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {pwErrors[key] && <p className="mt-1 text-xs text-red-500 animate-fade-in-down">{pwErrors[key]}</p>}
              </div>
            ))}

            <button type="submit" disabled={savingPw} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2">
              {savingPw ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;

