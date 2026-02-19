import { User, Course, Enrollment } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ============================================================================
// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
// ============================================================================
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts for each entity
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      pendingEnrollments,
      approvedEnrollments,
      rejectedEnrollments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: 'draft' }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'pending' }),
      Enrollment.countDocuments({ status: 'approved' }),
      Enrollment.countDocuments({ status: 'rejected' }),
    ]);

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .populate('student', 'name email avatar')
      .populate('course', 'title thumbnail price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top courses by enrollment
    const topCourses = await Course.find({ status: 'published' })
      .populate('instructor', 'name')
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .select('title enrollmentCount category price');

    const stats = {
      users: {
        total: totalUsers,
        students: totalStudents,
        instructors: totalInstructors,
        admins: totalAdmins,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
      },
      enrollments: {
        total: totalEnrollments,
        pending: pendingEnrollments,
        approved: approvedEnrollments,
        rejected: rejectedEnrollments,
      },
      recent: {
        enrollments: recentEnrollments,
        users: recentUsers,
        courses: topCourses,
      },
      revenue: {
        total: 'Offline', // MVP placeholder
        thisMonth: 'Offline',
        note: 'Online payment integration in Phase 2',
      },
    };

    return successResponse(res, { stats }, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    return errorResponse(res, 'Failed to fetch dashboard stats', 500);
  }
};

// ============================================================================
// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
// ============================================================================
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return successResponse(res, {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    }, 'Users retrieved successfully');
  } catch (error) {
    console.error('GetAllUsers error:', error);
    return errorResponse(res, 'Failed to fetch users', 500);
  }
};

// ============================================================================
// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Private (Admin)
// ============================================================================
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['student', 'instructor', 'admin'].includes(role)) {
      return errorResponse(res, 'Valid role is required (student, instructor, or admin)', 400);
    }

    // Prevent changing own role
    if (id === req.user._id.toString()) {
      return errorResponse(res, 'You cannot change your own role', 403);
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.role = role;
    await user.save();

    return successResponse(res, { user }, `User role updated to ${role} successfully`);
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    return errorResponse(res, 'Failed to update user role', 500);
  }
};

// ============================================================================
// @route   PUT /api/admin/users/:id/status
// @desc    Activate or deactivate user account
// @access  Private (Admin)
// ============================================================================
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return errorResponse(res, 'isActive field is required (true or false)', 400);
    }

    // Prevent deactivating own account
    if (id === req.user._id.toString()) {
      return errorResponse(res, 'You cannot deactivate your own account', 403);
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isActive = isActive;
    await user.save();

    return successResponse(
      res,
      { user },
      `User account ${isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    console.error('ToggleUserStatus error:', error);
    return errorResponse(res, 'Failed to update user status', 500);
  }
};

// ============================================================================
// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private (Admin)
// ============================================================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('enrolledCourses')
      .populate('createdCourses');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get enrollment statistics for students
    let enrollmentStats = null;
    if (user.role === 'student') {
      enrollmentStats = await Enrollment.aggregate([
        { $match: { student: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);
    }

    // Get course statistics for instructors
    let courseStats = null;
    if (user.role === 'instructor') {
      courseStats = await Course.aggregate([
        { $match: { instructor: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);
    }

    return successResponse(res, {
      user,
      stats: {
        enrollments: enrollmentStats,
        courses: courseStats,
      },
    }, 'User retrieved successfully');
  } catch (error) {
    console.error('GetUserById error:', error);
    return errorResponse(res, 'Failed to fetch user', 500);
  }
};

// ============================================================================
// @route   DELETE /api/admin/users/:id
// @desc    Delete user account (careful!)
// @access  Private (Admin)
// ============================================================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user._id.toString()) {
      return errorResponse(res, 'You cannot delete your own account', 403);
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent deleting admin users (extra safety)
    if (user.role === 'admin') {
      return errorResponse(res, 'Cannot delete admin users', 403);
    }

    await user.deleteOne();

    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('DeleteUser error:', error);
    return errorResponse(res, 'Failed to delete user', 500);
  }
};

// ============================================================================
// @route   GET /api/admin/courses
// @desc    Get all courses (including drafts) with filters
// @access  Private (Admin)
// ============================================================================
export const getAllCourses = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(query),
    ]);

    return successResponse(res, {
      courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    }, 'Courses retrieved successfully');
  } catch (error) {
    console.error('GetAllCourses error:', error);
    return errorResponse(res, 'Failed to fetch courses', 500);
  }
};
