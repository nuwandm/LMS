import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Generate JWT token
 * @param {String} userId - User ID
 * @returns {String} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Set JWT token in httpOnly cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('token', token, cookieOptions);
};

// ============================================================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ============================================================================
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Prevent direct admin registration (admins must be created manually)
    if (role === 'admin') {
      return errorResponse(res, 'Cannot register as admin', 403);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student', // Default to student
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Set cookie
    setTokenCookie(res, token);

    // Send welcome email (async, don't block response)
    sendWelcomeEmail(user).catch(err =>
      console.error('Failed to send welcome email:', err.message)
    );

    // Return user data (password excluded automatically by toJSON)
    return successResponse(
      res,
      { user, token },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, error.message || 'Registration failed', 500);
  }
};

// ============================================================================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ============================================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated', 403);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Set cookie
    setTokenCookie(res, token);

    // Remove password from response
    user.password = undefined;

    return successResponse(
      res,
      { user, token },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

// ============================================================================
// @route   POST /api/auth/logout
// @desc    Logout user (clear cookie)
// @access  Private
// ============================================================================
export const logout = async (req, res) => {
  try {
    // Clear cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 1000), // Expire immediately
      httpOnly: true,
    });

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

// ============================================================================
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
// ============================================================================
export const getMe = async (req, res) => {
  try {
    // User is already attached by verifyToken middleware
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses')
      .populate('createdCourses');

    return successResponse(res, { user }, 'User retrieved successfully');
  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, 'Failed to get user data', 500);
  }
};

// ============================================================================
// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
// ============================================================================
export const updateMe = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    // Fields that can be updated
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    return successResponse(res, { user }, 'Profile updated successfully');
  } catch (error) {
    console.error('UpdateMe error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

// ============================================================================
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
// ============================================================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Please provide email address', 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return successResponse(
        res,
        null,
        'If an account exists with this email, a password reset link will be sent'
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set expiry
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save({ validateBeforeSave: false });

    // Send password reset email (async, don't block response)
    sendPasswordResetEmail(user, resetToken).catch(err =>
      console.error('Failed to send password reset email:', err.message)
    );

    return successResponse(
      res,
      null,
      'If an account exists with this email, a password reset link will be sent'
    );
  } catch (error) {
    console.error('ForgotPassword error:', error);
    return errorResponse(res, 'Failed to process password reset request', 500);
  }
};

// ============================================================================
// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
// ============================================================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return errorResponse(res, 'Please provide new password', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Generate new token and log user in
    const newToken = generateToken(user._id, user.role);
    setTokenCookie(res, newToken);

    return successResponse(
      res,
      { token: newToken },
      'Password reset successful'
    );
  } catch (error) {
    console.error('ResetPassword error:', error);
    return errorResponse(res, 'Failed to reset password', 500);
  }
};

// ============================================================================
// @route   POST /api/auth/avatar
// @desc    Upload / replace profile avatar
// @access  Private
// ============================================================================
export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if one exists
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId).catch((err) =>
        console.error('Failed to delete old avatar:', err.message)
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: req.file.path,
        avatarPublicId: req.file.filename,
      },
      { new: true }
    );

    return successResponse(res, { user: updatedUser }, 'Avatar updated successfully');
  } catch (error) {
    console.error('UploadAvatar error:', error);
    return errorResponse(res, 'Failed to upload avatar', 500);
  }
};

// ============================================================================
// @route   PUT /api/auth/change-password
// @desc    Change password (logged-in user)
// @access  Private
// ============================================================================
export const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide current and new password', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('ChangePassword error:', error);
    return errorResponse(res, 'Failed to change password', 500);
  }
};

// ============================================================================
// Google OAuth Handlers (Placeholders - implement with Passport.js)
// ============================================================================

/**
 * @route   GET /api/auth/google
 * @desc    Redirect to Google OAuth
 * @access  Public
 */
export const googleOAuth = async (req, res) => {
  // TODO: Implement with Passport.js Google OAuth strategy
  return errorResponse(res, 'Google OAuth not yet implemented', 501);
};

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
export const googleOAuthCallback = async (req, res) => {
  // TODO: Implement with Passport.js Google OAuth strategy
  return errorResponse(res, 'Google OAuth callback not yet implemented', 501);
};
