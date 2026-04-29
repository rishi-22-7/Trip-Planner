/*
  adminService.js – API wrappers for admin-only endpoints.
  All routes hit /api/admin/... and require role === 'admin'.
  Used by the AdminDashboard and its sub-components.
*/
import api from './api';

// ── Platform Stats ──────────────────────────────────────────────────────────
export const getAdminStats = async () => (await api.get('/admin/stats')).data;

// ── Users ───────────────────────────────────────────────────────────────────
export const getAllUsers   = async () => (await api.get('/admin/users')).data;

// ── All Trips (admin view) ───────────────────────────────────────────────────
export const getAllAdminTrips = async () => (await api.get('/admin/trips')).data;

// ── Travel Tips (user-facing, read-only) ─────────────────────────────────────
export const getTips = async () => (await api.get('/tips')).data;

// ── Recommendations ──────────────────────────────────────────────────────────
// These hit /api/admin/recommendations – adjust if your backend route differs
export const getRecommendations    = async ()       => (await api.get('/admin/recommendations')).data;
export const createRecommendation  = async (data)   => (await api.post('/admin/recommendations', data)).data;
export const updateRecommendation  = async (id, d)  => (await api.put(`/admin/recommendations/${id}`, d)).data;
export const deleteRecommendation  = async (id)     => (await api.delete(`/admin/recommendations/${id}`)).data;
