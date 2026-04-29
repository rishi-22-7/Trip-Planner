/*
  Home.jsx – Public landing page for unauthenticated visitors.
  Shows the app's value proposition and a sample of destinations fetched
  from the API. Redirected away from by PublicOnlyRoute if already logged in.
*/
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, MapPin, Calendar, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DestinationCard from '../components/DestinationCard';
import { getAllDestinations } from '../services/destinationService';

// Static feature highlights
const FEATURES = [
  { icon: Plane,    title: 'Smart Trip Planning', desc: 'Create detailed trip plans with day-wise itineraries.' },
  { icon: MapPin,   title: 'Curated Destinations', desc: 'Browse handpicked destinations with local tips.' },
  { icon: Calendar, title: 'Booking Tracker',      desc: 'Keep all your hotel and flight bookings in one place.' },
  { icon: Shield,   title: 'Secure & Private',     desc: 'Your travel data is protected with JWT authentication.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await getAllDestinations();
        setDestinations((data.data || []).slice(0, 4));
      } catch {
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-bounce-soft">
            <Plane className="w-4 h-4" /> Plan smarter. Travel better.
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5 animate-fade-in-up delay-100">
            Your Personal<br />
            <span className="text-blue-600">Trip Planner</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8 animate-fade-in-up delay-200">
            Organise trips, manage bookings, plan activities, and track your travel history — all in one clean dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up delay-300">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105 hover:shadow-lg btn-glow"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-blue-400 text-slate-700 font-medium px-6 py-3 rounded-lg transition-all hover:scale-105 bg-white hover:shadow-md"
            >
              Sign In
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-5 justify-center mt-8 text-sm text-slate-400 animate-fade-in-up delay-400">
            {['No credit card required', 'Free to use', '100% secure'].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10 animate-fade-in-up">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm card-hover animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Destinations preview ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-slate-900">Popular Destinations</h2>
          <button
            onClick={() => navigate('/destinations')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 hover:gap-2"
          >
            View all <ArrowRight className="w-4 h-4 transition-transform" />
          </button>
        </div>

        {loadingDestinations ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-5/6" />
              </div>
            ))}
          </div>
        ) : destinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((dest, i) => (
              <div key={dest._id} className={`animate-fade-in-up delay-${i * 100}`}>
                <DestinationCard
                  destination={dest}
                  onPlanTrip={(name) => navigate(`/trips/new?destination=${encodeURIComponent(name)}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-10">No destinations available yet.</p>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;
