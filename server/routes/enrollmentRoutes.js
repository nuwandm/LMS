import express from 'express';
import {
  requestEnrollment,
  getMyEnrollments,
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  updateProgress,
  getEnrollmentById,
} from '../controllers/enrollmentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ============================================================================
// STUDENT ROUTES
// ============================================================================

/**
 * @route   POST /api/enrollments
 * @desc    Request enrollment in a course
 * @access  Private (Student)
 */
router.post('/', verifyToken, requireRole('student'), requestEnrollment);

/**
 * @route   GET /api/enrollments/my
 * @desc    Get current student's enrollments
 * @access  Private (Student)
 */
router.get('/my', verifyToken, requireRole('student'), getMyEnrollments);

/**
 * @route   PUT /api/enrollments/:id/progress
 * @desc    Update lecture completion progress
 * @access  Private (Student - enrolled)
 */
router.put('/:id/progress', verifyToken, requireRole('student'), updateProgress);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get single enrollment details
 * @access  Private (Student - own enrollment, Admin)
 */
router.get('/:id', verifyToken, getEnrollmentById);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments (admin view)
 * @access  Private (Admin)
 */
router.get('/', verifyToken, requireRole('admin'), getAllEnrollments);

/**
 * @route   PUT /api/enrollments/:id/approve
 * @desc    Approve enrollment request
 * @access  Private (Admin)
 */
router.put('/:id/approve', verifyToken, requireRole('admin'), approveEnrollment);

/**
 * @route   PUT /api/enrollments/:id/reject
 * @desc    Reject enrollment request
 * @access  Private (Admin)
 */
router.put('/:id/reject', verifyToken, requireRole('admin'), rejectEnrollment);

export default router;
