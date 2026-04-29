/*
  Register.jsx – Registration form page.
  Calls AuthContext.register() → authService.registerUser() → POST /api/auth/register.
  On success: auto-login (backend returns a token), navigate to /trips.
  Validates name, email, password length, and password confirmation client-side.
*/
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isRequired, isValidEmail, isValidPassword, doPasswordsMatch } from '../utils/validators';

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!isRequired(name))                          newErrors.name            = 'Full name is required.';
    if (!isRequired(email))                         newErrors.email           = 'Email is required.';
    else if (!isValidEmail(email))                  newErrors.email           = 'Enter a valid email address.';
    if (!isValidPassword(password))                 newErrors.password        = 'Password must be at least 6 characters.';
    if (!doPasswordsMatch(password, confirmPassword)) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/trips');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full py-2.5 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.01] transition-all ${
      errors[fieldName] ? 'border-red-400' : 'border-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-900 text-lg">Trip Planner</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create an account</h1>
          <p className="text-sm text-slate-500 mb-6">Start planning your trips today — it's free.</p>

          <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">

            {/* Name */}
            <div className="animate-fade-in-up delay-100">
              <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-name" type="text" autoComplete="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass('name')} pl-10 pr-4`} />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500 animate-fade-in-down">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="animate-fade-in-up delay-150">
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass('email')} pl-10 pr-4`} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500 animate-fade-in-down">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="animate-fade-in-up delay-200">
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass('password')} pl-10 pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors hover:scale-110">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 animate-fade-in-down">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="animate-fade-in-up delay-250">
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-confirm" type="password" autoComplete="new-password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClass('confirmPassword')} pl-10 pr-4`} />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 animate-fade-in-down">{errors.confirmPassword}</p>}
            </div>

            <div className="animate-fade-in-up delay-300">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-all text-sm hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 animate-fade-in-up delay-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
