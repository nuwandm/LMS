import api from './api';

/**
 * Admin Service
 * API calls for admin-specific operations
 */

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Get admin dashboard statistics
 * @returns {Promise} Dashboard stats (users, courses, enrollments, revenue)
 */
export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get all users with optional filters
 * @param {Object} params - Query parameters (role, status, search, page, limit)
 * @returns {Promise} List of users with pagination
 */
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

/**
 * Update user role
 * @param {String} userId - User ID
 * @param {String} role - New role (student, instructor, admin)
 * @returns {Promise} Updated user
 */
export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Toggle user active status (activate/deactivate)
 * @param {String} userId - User ID
 * @returns {Promise} Updated user
 */
export const toggleUserStatus = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/toggle-status`);
  return response.data;
};

/**
 * Delete user account (admin only)
 * @param {String} userId - User ID
 * @returns {Promise} Success message
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// ============================================================================
// ENROLLMENT MANAGEMENT
// ============================================================================

/**
 * Get all enrollments with filters
 * @param {Object} params - Query parameters (status, search, page, limit)
 * @returns {Promise} List of enrollments with pagination
 */
export const getAllEnrollments = async (params = {}) => {
  const response = await api.get('/enrollments', { params });
  return response.data;
};

/**
 * Approve enrollment request
 * @param {String} enrollmentId - Enrollment ID
 * @returns {Promise} Updated enrollment
 */
export const approveEnrollment = async (enrollmentId) => {
  const response = await api.put(`/enrollments/${enrollmentId}/approve`);
  return response.data;
};

/**
 * Reject enrollment request
 * @param {String} enrollmentId - Enrollment ID
 * @param {String} reason - Rejection reason
 * @returns {Promise} Updated enrollment
 */
export const rejectEnrollment = async (enrollmentId, reason) => {
  const response = await api.put(`/enrollments/${enrollmentId}/reject`, { reason });
  return response.data;
};

// ============================================================================
// COURSE MANAGEMENT (Admin)
// ============================================================================

/**
 * Get all courses (including drafts)
 * @param {Object} params - Query parameters
 * @returns {Promise} List of all courses
 */
export const getAllCoursesAdmin = async (params = {}) => {
  const response = await api.get('/admin/courses', { params });
  return response.data;
};

/**
 * Delete any course (admin privilege)
 * @param {String} courseId - Course ID
 * @returns {Promise} Success message
 */
export const deleteCourseAdmin = async (courseId) => {
  const response = await api.delete(`/admin/courses/${courseId}`);
  return response.data;
};

/**
 * Toggle course status (publish/unpublish/archive)
 * @param {String} courseId - Course ID
 * @param {String} status - New status
 * @returns {Promise} Updated course
 */
export const updateCourseStatus = async (courseId, status) => {
  const response = await api.put(`/admin/courses/${courseId}/status`, { status });
  return response.data;
};

export default {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  getAllCoursesAdmin,
  deleteCourseAdmin,
  updateCourseStatus,
};
