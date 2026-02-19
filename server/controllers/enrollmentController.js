import { Enrollment, Course, User } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  sendEnrollmentRequestEmail,
  sendEnrollmentApprovedEmail,
  sendEnrollmentRejectedEmail,
} from '../services/emailService.js';

// ============================================================================
// @route   POST /api/enrollments
// @desc    Request enrollment in a course (student)
// @access  Private (Student)
// ============================================================================
export const requestEnrollment = async (req, res) => {
  try {
    const { courseId, paymentNote } = req.body;

    if (!courseId) {
      return errorResponse(res, 'Course ID is required', 400);
    }

    // Check if course exists and is published
    const course = await Course.findById(courseId).populate('instructor', 'name email');

    if (!course) {
      return errorResponse(res, 'Course not found', 404);
    }

    if (course.status !== 'published') {
      return errorResponse(res, 'This course is not available for enrollment', 400);
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'pending') {
        return errorResponse(res, 'You already have a pending enrollment request for this course', 400);
      }
      if (existingEnrollment.status === 'approved') {
        return errorResponse(res, 'You are already enrolled in this course', 400);
      }
      if (existingEnrollment.status === 'rejected') {
        return errorResponse(res, 'Your enrollment request for this course was rejected', 400);
      }
    }

    // Create enrollment request
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      status: 'pending',
      paymentMethod: 'offline',
      paymentNote: paymentNote || '',
    });

    // Populate for response
    await enrollment.populate('course', 'title thumbnail price instructor');
    await enrollment.populate('student', 'name email');

    // Send confirmation email to student (async)
    sendEnrollmentRequestEmail(enrollment.student, enrollment.course).catch(err =>
      console.error('Failed to send enrollment request email:', err.message)
    );

    return successResponse(res, { enrollment }, 'Enrollment request submitted successfully', 201);
  } catch (error) {
    console.error('RequestEnrollment error:', error);
    return errorResponse(res, error.message || 'Failed to request enrollment', 500);
  }
};

// ============================================================================
// @route   GET /api/enrollments/my
// @desc    Get current student's enrollments
// @access  Private (Student)
// ============================================================================
export const getMyEnrollments = async (req, res) => {
  try {
    const { status } = req.query; // Optional filter by status

    const query = { student: req.user._id };
    if (status) {
      query.status = status;
    }

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title thumbnail instructor category price totalLectures totalDuration')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar',
        },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, { enrollments }, 'Enrollments retrieved successfully');
  } catch (error) {
    console.error('GetMyEnrollments error:', error);
    return errorResponse(res, 'Failed to fetch enrollments', 500);
  }
};

// ============================================================================
// @route   GET /api/enrollments
// @desc    Get all enrollments (admin only)
// @access  Private (Admin)
// ============================================================================
export const getAllEnrollments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('student', 'name email avatar')
        .populate('course', 'title instructor price')
        .populate({
          path: 'course',
          populate: {
            path: 'instructor',
            select: 'name',
          },
        })
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Enrollment.countDocuments(query),
    ]);

    return successResponse(res, {
      enrollments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    }, 'Enrollments retrieved successfully');
  } catch (error) {
    console.error('GetAllEnrollments error:', error);
    return errorResponse(res, 'Failed to fetch enrollments', 500);
  }
};

// ============================================================================
// @route   PUT /api/enrollments/:id/approve
// @desc    Approve enrollment request (admin only)
// @access  Private (Admin)
// ============================================================================
export const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id)
      .populate('student', 'name email')
      .populate('course', 'title instructor price totalLectures totalDuration');

    if (!enrollment) {
      return errorResponse(res, 'Enrollment not found', 404);
    }

    if (enrollment.status !== 'pending') {
      return errorResponse(res, 'Only pending enrollments can be approved', 400);
    }

    // Approve enrollment using model method
    await enrollment.approve(req.user._id);

    // Send approval email to student (async)
    sendEnrollmentApprovedEmail(enrollment.student, enrollment.course).catch(err =>
      console.error('Failed to send approval email:', err.message)
    );

    return successResponse(res, { enrollment }, 'Enrollment approved successfully');
  } catch (error) {
    console.error('ApproveEnrollment error:', error);
    return errorResponse(res, 'Failed to approve enrollment', 500);
  }
};

// ============================================================================
// @route   PUT /api/enrollments/:id/reject
// @desc    Reject enrollment request (admin only)
// @access  Private (Admin)
// ============================================================================
export const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return errorResponse(res, 'Rejection reason is required', 400);
    }

    const enrollment = await Enrollment.findById(id)
      .populate('student', 'name email')
      .populate('course', 'title instructor price');

    if (!enrollment) {
      return errorResponse(res, 'Enrollment not found', 404);
    }

    if (enrollment.status !== 'pending') {
      return errorResponse(res, 'Only pending enrollments can be rejected', 400);
    }

    // Reject enrollment using model method
    await enrollment.reject(reason);

    // Send rejection email to student (async)
    sendEnrollmentRejectedEmail(enrollment.student, enrollment.course, reason).catch(err =>
      console.error('Failed to send rejection email:', err.message)
    );

    return successResponse(res, { enrollment }, 'Enrollment rejected successfully');
  } catch (error) {
    console.error('RejectEnrollment error:', error);
    return errorResponse(res, 'Failed to reject enrollment', 500);
  }
};

// ============================================================================
// @route   PUT /api/enrollments/:id/progress
// @desc    Update lecture completion progress (student)
// @access  Private (Student - enrolled)
// ============================================================================
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { lectureId } = req.body;

    if (!lectureId) {
      return errorResponse(res, 'Lecture ID is required', 400);
    }

    const enrollment = await Enrollment.findOne({
      _id: id,
      student: req.user._id,
      status: 'approved',
    });

    if (!enrollment) {
      return errorResponse(res, 'Enrollment not found or not approved', 404);
    }

    // Mark lecture as completed
    await enrollment.completeLecture(lectureId);

    return successResponse(res, {
      enrollment,
      progress: enrollment.progress,
      completedLectures: enrollment.completedLectures.length,
    }, 'Progress updated successfully');
  } catch (error) {
    console.error('UpdateProgress error:', error);
    return errorResponse(res, 'Failed to update progress', 500);
  }
};

// ============================================================================
// @route   GET /api/enrollments/:id
// @desc    Get single enrollment details
// @access  Private (Student - own enrollment, Admin)
// ============================================================================
export const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id)
      .populate('student', 'name email avatar')
      .populate('course', 'title thumbnail instructor price totalLectures totalDuration')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar',
        },
      })
      .populate('completedLectures', 'title duration')
      .populate('approvedBy', 'name email');

    if (!enrollment) {
      return errorResponse(res, 'Enrollment not found', 404);
    }

    // Check access: student can only see their own, admin can see all
    if (req.user.role !== 'admin' && enrollment.student._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'You do not have permission to view this enrollment', 403);
    }

    return successResponse(res, { enrollment }, 'Enrollment retrieved successfully');
  } catch (error) {
    console.error('GetEnrollmentById error:', error);
    return errorResponse(res, 'Failed to fetch enrollment', 500);
  }
};
