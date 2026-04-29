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
        // Show only the first 4 destinations on the landing page
        setDestinations((data.data || []).slice(0, 4));
      } catch {
        // Landing page works even if destinations fail to load
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
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Plane className="w-4 h-4" /> Plan smarter. Travel better.
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
            Your Personal<br />
            <span className="text-blue-600">Trip Planner</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
            Organise trips, manage bookings, plan activities, and track your travel history — all in one clean dashboard.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-6 py-3 rounded-lg transition-colors bg-white"
            >
              Sign In
            </button>
          </div>
          <div className="flex flex-wrap gap-5 justify-center mt-8 text-sm text-slate-400">
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
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Everything You Need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Popular Destinations</h2>
          <button onClick={() => navigate('/destinations')} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loadingDestinations ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse">
                <div className="h-5 bg-slate-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-slate-100 rounded mb-2" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : destinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest._id}
                destination={dest}
                onPlanTrip={(name) => navigate(`/trips/new?destination=${encodeURIComponent(name)}`)}
              />
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
