/*
  bookingService.js – API wrappers for Booking CRUD.
  Bookings are linked to a trip via tripId.
  BookingPage uses getAllUserBookings(); TripDetails uses getBookingsByTrip().
*/
import api from './api';

export const getAllUserBookings  = async ()       => (await api.get('/bookings')).data;
export const getBookingsByTrip  = async (tripId) => (await api.get(`/bookings/trip/${tripId}`)).data;
export const createBooking      = async (data)   => (await api.post('/bookings', data)).data;
// updateBooking: used by BookingCard edit modal – PUT /api/bookings/:id
export const updateBooking      = async (id, d)  => (await api.put(`/bookings/${id}`, d)).data;
export const deleteBooking      = async (id)     => (await api.delete(`/bookings/${id}`)).data;

