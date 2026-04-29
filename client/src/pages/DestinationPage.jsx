/*
  DestinationPage.jsx – Browse all available destinations.
  Fetches destination list from the public API and renders DestinationCard grid.
  Route: /destinations (public, no auth required)
*/
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DestinationCard from '../components/DestinationCard';
import { getAllDestinations } from '../services/destinationService';
import { useAuth } from '../context/AuthContext';

const DestinationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await getAllDestinations();
        setDestinations(data.data || []);
      } catch {
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const filteredDestinations = destinations.filter((d) =>
    d.destinationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlanTrip = (destinationName) => {
    navigate(`/trips/new?destination=${encodeURIComponent(destinationName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" /> Destinations
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isAdmin ? 'Browse all destinations on the platform' : 'Explore places and start planning your next trip'}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search destinations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.02] transition-all"
            />
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-5/6 mb-4" />
                <div className="skeleton h-8 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && filteredDestinations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDestinations.map((dest, i) => (
              <div key={dest._id} className={`animate-fade-in-up delay-${Math.min(i * 100, 400)}`}>
                <DestinationCard
                  destination={dest}
                  onPlanTrip={isAdmin ? undefined : handlePlanTrip}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredDestinations.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl animate-fade-in-up">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 font-medium">No destinations found</p>
            <p className="text-sm text-slate-400 mt-1">Try a different search term.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DestinationPage;
