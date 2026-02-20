import api from './api';

/**
 * Enrollment Service - Handles all enrollment-related API calls
 */

// Request enrollment in a course (student)
export const requestEnrollment = async (courseId) => {
  const response = await api.post('/enrollments', { courseId });
  return response.data;
};

// Get my enrollments (student)
export const getMyEnrollments = async () => {
  const response = await api.get('/enrollments/my');
  return response.data;
};

// Update lecture progress (student)
export const updateProgress = async (enrollmentId, lectureId) => {
  const response = await api.put(`/enrollments/${enrollmentId}/progress`, { lectureId });
  return response.data;
};

// Get all enrollments (admin)
export const getAllEnrollments = async (params = {}) => {
  const response = await api.get('/enrollments', { params });
  return response.data;
};

// Approve enrollment (admin)
export const approveEnrollment = async (enrollmentId, paymentNote = '') => {
  const response = await api.put(`/enrollments/${enrollmentId}/approve`, { paymentNote });
  return response.data;
};

// Reject enrollment (admin)
export const rejectEnrollment = async (enrollmentId, rejectedReason) => {
  const response = await api.put(`/enrollments/${enrollmentId}/reject`, { reason: rejectedReason });
  return response.data;
};

export default {
  requestEnrollment,
  getMyEnrollments,
  updateProgress,
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
};
