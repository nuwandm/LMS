import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getUserById,
  deleteUser,
  getAllCourses,
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require admin role
router.use(verifyToken, requireRole('admin'));

// ============================================================================
// DASHBOARD & STATISTICS
// ============================================================================

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', getDashboardStats);

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin)
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details
 * @access  Private (Admin)
 */
router.get('/users/:id', getUserById);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Private (Admin)
 */
router.put('/users/:id/role', updateUserRole);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Activate/deactivate user account
 * @access  Private (Admin)
 */
router.put('/users/:id/status', toggleUserStatus);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account
 * @access  Private (Admin)
 */
router.delete('/users/:id', deleteUser);

// ============================================================================
// COURSE MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses (including drafts)
 * @access  Private (Admin)
 */
router.get('/courses', getAllCourses);

export default router;
