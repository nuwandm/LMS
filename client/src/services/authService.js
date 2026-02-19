import api from './api';

/**
 * Auth Service - Handles all authentication-related API calls
 */

// Register new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Logout user
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Update user profile
export const updateProfile = async (userData) => {
  const response = await api.put('/auth/me', userData);
  return response.data;
};

// Forgot password - send reset email
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password: newPassword });
  return response.data;
};

// Change password (when logged in)
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};
