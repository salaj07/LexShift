/**
 * @file src/features/auth/api/authApi.js
 * @description Axios API layer for all auth operations.
 *
 * All requests use withCredentials so the httpOnly JWT cookie
 * is automatically sent/received from the backend.
 */

import axios from 'axios';

const authAxios = axios.create({
  baseURL: 'http://localhost:3000/auth',
  withCredentials: true,
});

export const registerUser = (data) =>
  authAxios.post('/register', data);

export const loginUser = (data) =>
  authAxios.post('/login', data);

export const verifyOtp = (data) =>
  authAxios.post('/verify-otp', data);

export const forgotPassword = (data) =>
  authAxios.post('/forgot-password', data);

export const resetPassword = (data) =>
  authAxios.post('/reset-password', data);

// Verify the httpOnly cookie and return user data.
// Called on every app load to restore session from cookie.
export const getMe = () =>
  authAxios.get('/me');

// Clears the httpOnly cookie server-side (true logout).
export const logoutUser = () =>
  authAxios.post('/logout');
