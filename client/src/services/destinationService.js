/*
  destinationService.js – API wrappers for Destination CRUD.
  Public GET is available to all users; write operations require admin role.
  Used by Home, DestinationPage, and admin pages.
*/
import api from './api';

export const getAllDestinations  = async ()       => (await api.get('/destinations')).data;
export const createDestination   = async (data)   => (await api.post('/destinations', data)).data;
export const updateDestination   = async (id, d)  => (await api.put(`/destinations/${id}`, d)).data;
export const deleteDestination   = async (id)     => (await api.delete(`/destinations/${id}`)).data;
