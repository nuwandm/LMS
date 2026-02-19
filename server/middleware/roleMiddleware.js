import { errorResponse } from '../utils/apiResponse.js';

/**
 * Check if user has required role(s)
 * Must be used AFTER verifyToken middleware
 *
 * @param {...String} roles - Allowed roles (e.g., 'admin', 'instructor', 'student')
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/admin-only', verifyToken, requireRole('admin'), controller);
 * router.post('/create-course', verifyToken, requireRole('instructor', 'admin'), controller);
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be attached by verifyToken)
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access forbidden. This action requires one of these roles: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Check if user is the owner of a resource
 * Useful for checking if user can edit their own courses, profile, etc.
 *
 * @param {String} resourceField - Field name in resource that contains owner ID (default: 'instructor')
 * @returns {Function} Express middleware
 *
 * @example
 * // For courses where instructor field is the owner
 * router.put('/courses/:id', verifyToken, requireRole('instructor'), checkOwnership('instructor'), controller);
 */
export const checkOwnership = (resourceField = 'instructor') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      // Allow admins to bypass ownership check
      if (req.user.role === 'admin') {
        return next();
      }

      // Get resource (assumes it's been attached to req by previous middleware)
      const resource = req.resource; // Must be set by route handler

      if (!resource) {
        return errorResponse(res, 'Resource not found', 404);
      }

      // Check ownership
      const ownerId = resource[resourceField]?.toString() || resource[resourceField];
      const userId = req.user._id.toString();

      if (ownerId !== userId) {
        return errorResponse(res, 'You do not have permission to modify this resource', 403);
      }

      next();
    } catch (error) {
      return errorResponse(res, 'Authorization check failed', 500);
    }
  };
};

/**
 * Require email verification
 * Blocks access if user's email is not verified
 */
export const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  if (!req.user.isEmailVerified) {
    return errorResponse(
      res,
      'Email verification required. Please verify your email to access this feature.',
      403
    );
  }

  next();
};
