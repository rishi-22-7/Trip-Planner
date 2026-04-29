/*
  activityService.js – API wrappers for Activity CRUD.
  Activities belong to a trip (tripId required on create).
  Used by TripDetails.jsx for the day-wise itinerary section.
*/
import api from './api';

export const getActivitiesByTrip = async (tripId) => (await api.get(`/activities/trip/${tripId}`)).data;
export const createActivity      = async (data)   => (await api.post('/activities', data)).data;
// updateActivity: used by ActivityCard edit modal – PUT /api/activities/:id
export const updateActivity      = async (id, d)  => (await api.put(`/activities/${id}`, d)).data;
export const deleteActivity      = async (id)     => (await api.delete(`/activities/${id}`)).data;

