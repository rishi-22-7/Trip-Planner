/*
  tripService.js – API wrappers for all Trip CRUD operations.
  Called by TripContext and TripDetails. All routes are JWT-protected.
*/
import api from './api';

export const getAllTrips    = async ()           => (await api.get('/trips')).data;
export const getTripById   = async (id)         => (await api.get(`/trips/${id}`)).data;
export const createTrip    = async (data)       => (await api.post('/trips', data)).data;
export const updateTrip    = async (id, data)   => (await api.put(`/trips/${id}`, data)).data;
export const deleteTrip    = async (id)         => (await api.delete(`/trips/${id}`)).data;
