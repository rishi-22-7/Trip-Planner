/*
  authService.js – API wrapper for authentication endpoints.
  Used by AuthContext to login and register users, and by UserProfile to change password.
*/
import api from './api';

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

// changePassword: called from UserProfile "Security" section
// Sends currentPassword + newPassword to PUT /api/auth/change-password
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

