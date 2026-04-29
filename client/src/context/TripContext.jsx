/*
  TripContext.jsx – Global state for the user's trip list.
  Prevents prop-drilling between Dashboard, TripCard, and TripDetails.
  Provides fetchTrips, addTrip, editTrip, removeTrip actions.
  Each action updates the local list optimistically after the API call succeeds.
*/
import { createContext, useContext, useState, useCallback } from 'react';
import { getAllTrips, createTrip, updateTrip, deleteTrip } from '../services/tripService';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // useCallback prevents a new function reference on every render,
  // which would otherwise cause infinite loops in useEffect([fetchTrips])
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTrips();
      setTrips(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTrip = async (tripData) => {
    const data = await createTrip(tripData);
    setTrips((prev) => [...prev, data.data]);
    return data;
  };

  const editTrip = async (id, tripData) => {
    const data = await updateTrip(id, tripData);
    setTrips((prev) => prev.map((t) => (t._id === id ? data.data : t)));
    return data;
  };

  const removeTrip = async (id) => {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <TripContext.Provider value={{ trips, loading, error, fetchTrips, addTrip, editTrip, removeTrip }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrips must be used inside <TripProvider>');
  return context;
};

export default TripContext;
