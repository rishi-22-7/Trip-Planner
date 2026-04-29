/*
  validators.js – Pure validation helper functions for all forms.
  Keeps validation logic out of UI components so it can be tested independently.
  Used by Login.jsx, Register.jsx, and CreateTrip.jsx.
*/

export const isRequired = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0;

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

export const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 6;

export const doPasswordsMatch = (password, confirmPassword) =>
  password === confirmPassword;

export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return new Date(endDate) >= new Date(startDate);
};

export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};
