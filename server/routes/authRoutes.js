import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
  googleOAuth,
  googleOAuthCallback,
  uploadAvatarController,
  changePasswordController,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../config/cloudinary.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// ============================================================================
// RATE LIMITING for auth routes (prevent brute force attacks)
// ============================================================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per windowMs
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 requests per hour
  message: 'Too many password reset attempts. Please try again after 1 hour.',
});

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', passwordResetLimiter, forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token', resetPassword);

/**
 * @route   GET /api/auth/google
 * @desc    Redirect to Google OAuth
 * @access  Public
 */
router.get('/google', googleOAuth);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', googleOAuthCallback);

// ============================================================================
// PROTECTED ROUTES (require authentication)
// ============================================================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', verifyToken, getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', verifyToken, updateMe);

/**
 * @route   POST /api/auth/avatar
 * @desc    Upload / replace profile picture
 * @access  Private
 */
router.post('/avatar', verifyToken, uploadAvatar.single('avatar'), uploadAvatarController);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password (logged-in user)
 * @access  Private
 */
router.put('/change-password', verifyToken, changePasswordController);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookie)
 * @access  Private
 */
router.post('/logout', verifyToken, logout);

export default router;
