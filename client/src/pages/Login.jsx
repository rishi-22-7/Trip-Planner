/*
  Login.jsx – Login form page.
  Calls AuthContext.login() → authService.loginUser() → POST /api/auth/login.
  On success: saves JWT to localStorage and navigates to /trips or /admin/dashboard.
  Uses validators.js for client-side validation before submitting.
*/
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isRequired, isValidEmail } from '../utils/validators';

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]     = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!isRequired(email))      newErrors.email    = 'Email is required.';
    else if (!isValidEmail(email)) newErrors.email  = 'Enter a valid email address.';
    if (!isRequired(password))   newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      const role = data.data?.user?.role;
      navigate(role === 'admin' ? '/admin/dashboard' : '/trips');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-900 text-lg">Trip Planner</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-sm text-slate-500 mb-6">Welcome back. Enter your credentials to continue.</p>

          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div className="animate-fade-in-up delay-100">
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.01] transition-all ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 animate-fade-in-down">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="animate-fade-in-up delay-200">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.01] transition-all ${errors.password ? 'border-red-400' : 'border-slate-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 animate-fade-in-down">{errors.password}</p>
              )}
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
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500 animate-fade-in-up delay-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700 transition-colors hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
